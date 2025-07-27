import { useState, useEffect, useCallback } from "react";
import { Alert, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { PaymentService } from "../services/payment.service";

import { useFocusEffect } from "@react-navigation/native";

export const usePayment = (navigation) => {
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPackageForPayment, setSelectedPackageForPayment] =
    useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("paypal");
  const [currentPayPalOrderId, setCurrentPayPalOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState(null);
  const [currentMembership, setCurrentMembership] = useState(null);

  const { user, updateMembershipStatus } = useAuth();
  const userId = user?._id;

  // Fetch current membership on mount
  useEffect(() => {
    fetchCurrentMembership();
  }, []);

  const fetchCurrentMembership = async () => {
    try {
      const membership = await PaymentService.getCurrentMembership();
      console.log("✅ Current membership found:", membership?.package_id?.name);
      setCurrentMembership(membership);
    } catch (error) {
      // Check if it's a 404 error (no active membership)
      if (
        error.message &&
        error.message.includes("Không có membership đang hoạt động")
      ) {
        console.log(
          "ℹ️ User has no active membership - this is normal for new users"
        );
      } else {
        console.error("❌ Error fetching current membership:", error);
      }
      setCurrentMembership(null);
    }
  };

  const previewUpgrade = async (newPackageId) => {
    try {
      console.log("🔍 Previewing upgrade for package:", newPackageId);
      const upgradeData = await PaymentService.previewUpgrade({ newPackageId });
      console.log("📊 Upgrade preview result:", upgradeData);
      setUpgradeInfo(upgradeData);
      return upgradeData;
    } catch (error) {
      console.error("❌ Error previewing upgrade:", error);
      // Don't throw error, let the calling function handle it
      throw error;
    }
  };

  const cancelMembership = async () => {
    try {
      console.log("🔄 Cancelling current membership...");
      const result = await PaymentService.cancelMembership();
      console.log("✅ Membership cancelled successfully:", result);

      // Update membership status
      await updateMembershipStatus(null);
      setCurrentMembership(null);

      Alert.alert(
        "✅ Hủy gói thành công",
        "Gói thành viên của bạn đã được hủy. Bạn vẫn có thể sử dụng các tính năng miễn phí.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Main", { screen: "HomeTab" }),
          },
        ]
      );

      return result;
    } catch (error) {
      console.error("❌ Error cancelling membership:", error);
      Alert.alert("❌ Lỗi", "Không thể hủy gói. Vui lòng thử lại sau.");
      throw error;
    }
  };

  const clearPaymentOrder = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("pendingPayPalOrder");
      setCurrentPayPalOrderId(null);
    } catch (error) {
      console.error("Error clearing payment order:", error);
    }
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    Alert.alert(
      "🎉 Thanh toán thành công!",
      "Gói thành viên của bạn đã được kích hoạt.",
      [
        {
          text: "Tuyệt vời!",
          onPress: async () => {
            if (selectedPackageForPayment) {
              await updateMembershipStatus({
                package_id: selectedPackageForPayment._id,
                package_name: selectedPackageForPayment.name,
                start_date: new Date().toISOString(),
                end_date: new Date(
                  Date.now() +
                    selectedPackageForPayment.duration_days *
                      24 *
                      60 *
                      60 *
                      1000
                ).toISOString(),
              });
            }
            await clearPaymentOrder();
            // Refresh current membership
            await fetchCurrentMembership();
            navigation.navigate("Main", { screen: "HomeTab" });
          },
        },
      ]
    );
  }, [
    selectedPackageForPayment,
    updateMembershipStatus,
    clearPaymentOrder,
    navigation,
  ]);

  const captureAndConfirmPayment = useCallback(
    async (orderId) => {
      if (orderId && selectedPackageForPayment) {
        navigation.navigate("Checkout", {
          orderId: orderId,
          packageData: selectedPackageForPayment,
        });
      } else {
        Alert.alert("Lỗi", "Không tìm thấy thông tin đơn hàng để xác nhận.");
      }
    },
    [navigation, selectedPackageForPayment]
  );

  const initiatePayPalPayment = async (packageData) => {
    setIsProcessing(true);
    try {
      console.log("🚀 Starting PayPal payment for package:", packageData.name);

      // Kiểm tra nếu là gói Default thì không cần thanh toán
      if (packageData.name === "default" || packageData.price === 0) {
        console.log("ℹ️ Default package selected, no payment required");
        Alert.alert(
          "Thông báo",
          "Gói Default là gói miễn phí. Bạn có thể sử dụng ngay!"
        );
        setIsProcessing(false);
        return;
      }

      // Check if user has current membership and preview upgrade if needed
      if (
        currentMembership &&
        currentMembership.package_id._id !== packageData._id
      ) {
        console.log("🔄 User has active membership, checking upgrade...");
        try {
          const upgradeData = await previewUpgrade(packageData._id);
          const isUpgrade = upgradeData.upgradeCost > 0;

          if (isUpgrade) {
            console.log("💰 Upgrade cost calculated:", upgradeData.upgradeCost);
            const confirmUpgrade = await new Promise((resolve) => {
              Alert.alert(
                "Nâng cấp gói thành viên",
                `Bạn đang sử dụng gói "${upgradeData.from}" với ${
                  upgradeData.remainingDays
                } ngày còn lại.\n\nNâng cấp lên gói "${
                  upgradeData.to
                }":\n• Giá trị còn lại: ${upgradeData.remainingValue.toLocaleString()} VND\n• Chi phí nâng cấp: ${upgradeData.upgradeCost.toLocaleString()} VND\n• Tổng cộng: ${upgradeData.totalCost.toLocaleString()} VND`,
                [
                  {
                    text: "Hủy",
                    style: "cancel",
                    onPress: () => resolve(false),
                  },
                  { text: "Nâng cấp", onPress: () => resolve(true) },
                ]
              );
            });

            if (!confirmUpgrade) {
              console.log("❌ User cancelled upgrade");
              setIsProcessing(false);
              return;
            }
            console.log("✅ User confirmed upgrade");
          }
        } catch (error) {
          console.error("Error checking upgrade:", error);
          // If error is about no active membership, continue with normal payment
          if (
            error.message &&
            error.message.includes("Không có gói hiện tại đang hoạt động")
          ) {
            console.log(
              "ℹ️ User has no active membership, proceeding with normal payment"
            );
          } else {
            // For other errors, show alert and stop
            Alert.alert(
              "Lỗi",
              "Không thể kiểm tra thông tin nâng cấp. Vui lòng thử lại."
            );
            setIsProcessing(false);
            return;
          }
        }
      } else {
        console.log(
          "🆕 User has no active membership or same package, proceeding with normal payment"
        );
      }

      // Save the selected package data to AsyncStorage before navigating
      await AsyncStorage.setItem(
        "pendingPackageData",
        JSON.stringify(packageData)
      );

      const payload = {
        package_id: packageData._id,
        return_url: "quitsmokingapp://checkout/success",
        cancel_url: "quitsmokingapp://checkout/cancel",
      };

      console.log("📤 Creating PayPal order...");
      const res = await PaymentService.createPaypalOrder(payload);

      if (res.approveUrl) {
        console.log("✅ PayPal order created successfully");
        // Navigate to our new WebView screen instead of opening an external browser
        navigation.navigate("PayPalWebView", { url: res.approveUrl });
      } else {
        console.error("❌ No approve URL received from PayPal");
        Alert.alert("Lỗi", "Không nhận được URL thanh toán từ PayPal.");
      }
    } catch (err) {
      console.error("❌ PayPal payment error:", err);
      // Show a more specific error if possible
      const errorMessage =
        err.message || "Không thể bắt đầu thanh toán PayPal. Vui lòng thử lại.";
      Alert.alert("Lỗi thanh toán", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const initiateMomoPayment = async () => {
    Alert.alert("Thanh toán Momo", "Chức năng này đang được phát triển.", [
      { text: "OK" },
    ]);
  };

  const handleSubscribe = async () => {
    if (!selectedPackageForPayment) return;

    // Kiểm tra nếu là gói Default thì không cần thanh toán
    if (
      selectedPackageForPayment.name === "default" ||
      selectedPackageForPayment.price === 0
    ) {
      console.log("ℹ️ Default package selected, no payment required");
      setPaymentModalVisible(false);
      Alert.alert(
        "Thông báo",
        "Gói Default là gói miễn phí. Bạn có thể sử dụng ngay!",
        [
          {
            text: "OK",
            onPress: () => {
              // Cập nhật membership status cho gói Default
              updateMembershipStatus({
                package_id: selectedPackageForPayment._id,
                package_name: selectedPackageForPayment.name,
                start_date: new Date().toISOString(),
                end_date: new Date(
                  Date.now() +
                    (selectedPackageForPayment.duration_days || 365) *
                      24 *
                      60 *
                      60 *
                      1000
                ).toISOString(),
                status: "active",
              });
              navigation.navigate("Main", { screen: "HomeTab" });
            },
          },
        ]
      );
      return;
    }

    setPaymentModalVisible(false);
    if (selectedPaymentMethod === "paypal") {
      await initiatePayPalPayment(selectedPackageForPayment);
    } else if (selectedPaymentMethod === "momo") {
      await initiateMomoPayment();
    }
  };

  const openPaymentModal = (pkg) => {
    // Kiểm tra nếu là gói Default thì không mở payment modal
    if (pkg.name === "default" || pkg.price === 0) {
      console.log("ℹ️ Default package selected, no payment modal needed");
      Alert.alert(
        "Thông báo",
        "Gói Default là gói miễn phí. Bạn có thể sử dụng ngay!",
        [
          {
            text: "OK",
            onPress: () => {
              // Cập nhật membership status cho gói Default
              updateMembershipStatus({
                package_id: pkg._id,
                package_name: pkg.name,
                start_date: new Date().toISOString(),
                end_date: new Date(
                  Date.now() + (pkg.duration_days || 365) * 24 * 60 * 60 * 1000
                ).toISOString(),
                status: "active",
              });
              navigation.navigate("Main", { screen: "HomeTab" });
            },
          },
        ]
      );
      return;
    }

    setSelectedPackageForPayment(pkg);
    setPaymentModalVisible(true);
  };

  return {
    isPaymentModalVisible,
    setPaymentModalVisible,
    selectedPackageForPayment,
    openPaymentModal,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    handleSubscribe,
    isProcessing,
    currentMembership,
    upgradeInfo,
    previewUpgrade,
    fetchCurrentMembership,
    cancelMembership,
  };
};
