import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PaymentService } from "../services/payment.service";
import { useAuth } from "../contexts/AuthContext";

const CheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { updateMembershipStatus } = useAuth();

  // Get orderId and packageData from the navigation params
  const { orderId, packageData } = route.params || {};

  const [status, setStatus] = useState("processing"); // 'processing', 'success', 'fail'
  const [upgradeInfo, setUpgradeInfo] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      // Thêm log chi tiết để kiểm tra dữ liệu
      console.log("--- BẮT ĐẦU XỬ LÝ THANH TOÁN ---");
      console.log("OrderId nhận được:", orderId);
      console.log(
        "Dữ liệu gói nhận được:",
        JSON.stringify(packageData, null, 2)
      );

      if (orderId) {
        console.log(
          `CheckoutScreen: Đang gửi yêu cầu capture cho PayPal orderId: ${orderId}`
        );
        try {
          // Gửi orderId tới backend để xác thực
          const res = await PaymentService.capturePaypalOrder({ orderId });
          console.log("Phản hồi từ server khi capture thành công:", res);

          setStatus("success");

          // NẾU THÀNH CÔNG, CẬP NHẬT TRẠNG THÁI THÀNH VIÊN
          // Ưu tiên sử dụng dữ liệu thành viên trả về từ server vì nó chính xác nhất.
          if (res && res.userMembership) {
            let membership = res.userMembership;
            // Nếu thiếu package_name, bổ sung từ packageData
            if (!membership.package_name && packageData?.name) {
              membership = {
                ...membership,
                package_name: packageData.name,
                package_id: {
                  _id: packageData._id,
                  name: packageData.name,
                  // ...bổ sung các trường khác nếu cần
                },
              };
            }
            await updateMembershipStatus(membership);
            console.log("MembershipStatus sau update:", membership);
          } else {
            // Fallback nếu server không trả về userMembership (kịch bản cũ)
            if (packageData) {
              console.log(
                "Server không trả về userMembership. Dùng packageData để cập nhật (fallback)..."
              );
              await updateMembershipStatus({
                package_id: packageData._id,
                package_name: packageData.name,
                // Dữ liệu này có thể không chính xác 100% so với server
                start_date: new Date().toISOString(),
                end_date: new Date(
                  Date.now() + packageData.duration_days * 24 * 60 * 60 * 1000
                ).toISOString(),
                status: "active",
              });
              console.log("Cập nhật (fallback) thành công.");
            }
          }
        } catch (err) {
          // Log lỗi chi tiết hơn
          console.error("LỖI KHI CAPTURE THANH TOÁN:", err);
          const errorMessage = err.message || "Đã có lỗi xảy ra từ server.";
          console.error(`Chi tiết lỗi: ${errorMessage}`);
          setStatus("fail");
        } finally {
          // Luôn dọn dẹp dữ liệu gói đang chờ
          console.log("Dọn dẹp pendingPackageData khỏi AsyncStorage.");
          await AsyncStorage.removeItem("pendingPackageData");
        }
      } else {
        console.error(
          "CheckoutScreen: Không tìm thấy orderId trong route params."
        );
        setStatus("fail");
        await AsyncStorage.removeItem("pendingPackageData");
      }
      console.log("--- KẾT THÚC XỬ LÝ THANH TOÁN ---");
    };

    processPayment();
  }, [orderId, packageData, updateMembershipStatus]);

  const goHome = () => {
    navigation.navigate("Main", { screen: "HomeTab" });
  };

  const viewTransactions = () => {
    navigation.navigate("Transactions");
  };

  // Render different content based on the payment status
  const renderContent = () => {
    switch (status) {
      case "processing":
        return (
          <>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.statusText}>
              Đang xử lý thanh toán của bạn...
            </Text>
            <Text style={styles.processingSubtext}>
              Vui lòng không đóng ứng dụng
            </Text>
          </>
        );
      case "success":
        return (
          <>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#4ECB71" />
            </View>
            <Text style={styles.title}>Thanh toán thành công!</Text>
            <Text style={styles.message}>
              Cảm ơn bạn đã mua hàng. Gói thành viên của bạn đã được kích hoạt.
            </Text>

            {packageData && (
              <View style={styles.packageInfo}>
                <Text style={styles.packageName}>
                  {packageData.name === "default"
                    ? "Gói Mặc định"
                    : `Gói ${packageData.name.toUpperCase()}`}
                </Text>
                <Text style={styles.packageDuration}>
                  Thời hạn: {packageData.duration_days} ngày
                </Text>
                {packageData.price > 0 && (
                  <Text style={styles.packagePrice}>
                    Giá: {packageData.price.toLocaleString("vi-VN")} VND
                  </Text>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={goHome} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Về trang chủ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={viewTransactions}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Xem lịch sử</Text>
              </TouchableOpacity>
            </View>
          </>
        );
      case "fail":
        return (
          <>
            <View style={styles.errorIconContainer}>
              <Ionicons name="close-circle" size={80} color="#FF6347" />
            </View>
            <Text style={styles.title}>Thanh toán thất bại</Text>
            <Text style={styles.message}>
              Đã xảy ra sự cố khi hoàn tất thanh toán của bạn. Vui lòng thử lại
              hoặc liên hệ với bộ phận hỗ trợ.
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={goHome} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Về trang chủ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F4F6FB",
  },
  statusText: {
    marginTop: 20,
    fontSize: 18,
    color: "#6C63FF",
    fontWeight: "600",
  },
  processingSubtext: {
    marginTop: 10,
    fontSize: 14,
    color: "#6C757D",
    fontStyle: "italic",
  },
  successIconContainer: {
    marginBottom: 20,
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#22223B",
    marginBottom: 15,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#4A4E69",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  packageInfo: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22223B",
    marginBottom: 8,
    textAlign: "center",
  },
  packageDuration: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 4,
    textAlign: "center",
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28A745",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6C63FF",
  },
  secondaryButtonText: {
    color: "#6C63FF",
    fontSize: 17,
    fontWeight: "700",
  },
});

export default CheckoutScreen;
