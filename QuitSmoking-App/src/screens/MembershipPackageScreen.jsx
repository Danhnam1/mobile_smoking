import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Dimensions,
  Linking,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { getMembershipPackages } from "../api/user";
import { Picker } from "@react-native-picker/picker";
import { WebView } from "react-native-webview";
import { useAuth } from "../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import queryString from "query-string";
import { usePayment } from "../hooks/usePayment";
import CurrentMembershipCard from "../components/CurrentMembershipCard";

const { width, height } = Dimensions.get("window");

const MembershipPackageScreen = ({ navigation, route }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useAuth();
  const {
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
  } = usePayment(navigation);

  const { user, updateMembershipStatus } = useAuth();

  const userId = user?._id;
  const userToken = token;

  const fetchPackages = useCallback(async () => {
    if (!userToken) {
      console.log(
        "fetchPackages: userToken is missing, cannot fetch packages."
      );
      return;
    }
    try {
      setLoading(true);
      const data = await getMembershipPackages(userToken);
      setPackages(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching membership packages:", err);
      setError("Không thể tải gói thành viên. Vui lòng thử lại sau.");
      Alert.alert("Lỗi", "Không thể tải gói thành viên. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  // useEffect for initial data fetch and logging
  useEffect(() => {
    console.log("MembershipPackageScreen: User object from AuthContext", user);
    console.log("MembershipPackageScreen: Token from AuthContext", token);
    if (userToken) {
      fetchPackages();
    }
  }, [user, token, fetchPackages]);

  const renderFeature = (iconName, text, isIncluded) => (
    <View style={styles.featureItem}>
      <Ionicons
        name={isIncluded ? "checkmark-circle" : "close-circle"}
        size={20}
        color={isIncluded ? "#4ECB71" : "#FF6347"}
        style={styles.featureIcon}
      />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  const getCurrentMembershipInfo = () => {
    if (!currentMembership) return null;

    const expireDate = new Date(currentMembership.expire_date);
    const now = new Date();
    const remainingDays = Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24));

    return {
      packageName: currentMembership.package_id.name,
      remainingDays: Math.max(0, remainingDays),
      expireDate: expireDate,
    };
  };

  const currentMembershipInfo = getCurrentMembershipInfo();

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4ECB71" />
        <Text style={styles.loadingText}>Đang tải gói thành viên...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPackages}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedPackageMonthlyPrice = selectedPackageForPayment
    ? (
        selectedPackageForPayment.price /
        (selectedPackageForPayment.duration_days / 30)
      ).toFixed(0)
    : 0;

  const baseMonthlyPrice = 99000;

  let savingsPercentage = 0;
  let savingsAmount = 0;

  if (selectedPackageForPayment && selectedPackageForPayment.price > 0) {
    const durationInMonths = selectedPackageForPayment.duration_days / 30;
    if (durationInMonths > 1) {
      const theoreticalPrice = durationInMonths * baseMonthlyPrice;
      const actualPrice = selectedPackageForPayment.price;
      savingsAmount = theoreticalPrice - actualPrice;

      if (savingsAmount > 0) {
        savingsPercentage = ((savingsAmount / theoreticalPrice) * 100).toFixed(
          0
        );
      }
    }
  }

  console.log("--- Debugging Savings --- ", {
    selectedPackageForPayment,
    selectedPackageMonthlyPrice,
    baseMonthlyPrice,
    savingsAmount,
    savingsPercentage,
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Chọn gói thành viên của bạn</Text>
      <Text style={styles.subtitle}>
        Nâng cấp để có thêm lợi ích và hỗ trợ!
      </Text>

      {/* Current Membership Info */}
      {currentMembership && (
        <CurrentMembershipCard
          currentMembership={currentMembership}
          onUpgradeMembership={(packageId) => {
            // Tìm package và mở payment modal
            const targetPackage = packages.find((pkg) => pkg._id === packageId);
            if (targetPackage) {
              openPaymentModal(targetPackage);
            }
          }}
          packages={packages}
        />
      )}

      {packages.length === 0 && !loading && !error && (
        <View style={styles.noPackagesContainer}>
          <Text style={styles.noPackagesText}>
            Hiện chưa có gói thành viên nào.
          </Text>
        </View>
      )}

      {packages.map((pkg) => {
        const isCurrentPackage =
          currentMembershipInfo &&
          currentMembershipInfo.remainingDays > 0 &&
          currentMembershipInfo.packageName === pkg.name;
        const isUpgrade =
          currentMembershipInfo &&
          currentMembershipInfo.remainingDays > 0 &&
          currentMembershipInfo.packageName !== pkg.name &&
          pkg.price > (currentMembership?.package_id?.price || 0);

        return (
          <View
            key={pkg._id}
            style={[
              styles.packageCard,
              pkg.type === "pro" && styles.proPackageCard,
              isCurrentPackage && styles.currentPackageCard,
            ]}
          >
            <View style={styles.packageHeader}>
              <MaterialCommunityIcons
                name={pkg.type === "pro" ? "crown" : "leaf"}
                size={30}
                color={pkg.type === "pro" ? "#FFD700" : "#4ECB71"}
              />
              <Text
                style={[
                  styles.packageName,
                  pkg.type === "pro" && styles.proPackageName,
                ]}
              >
                {pkg.type === "default" ? "Mặc định" : pkg.name.toUpperCase()}
              </Text>
              {isCurrentPackage && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Hiện tại</Text>
                </View>
              )}
              {isUpgrade && (
                <View style={styles.upgradeBadge}>
                  <Text style={styles.upgradeBadgeText}>Có thể nâng cấp</Text>
                </View>
              )}
            </View>
            <Text style={styles.packageDescription}>{pkg.description}</Text>
            <Text style={styles.packagePrice}>
              {pkg.price === 0
                ? "Miễn phí"
                : `${pkg.price.toLocaleString()} VND`}
            </Text>
            {pkg.duration_days && (
              <Text style={styles.packageDuration}>
                Thời hạn: {pkg.duration_days} ngày
              </Text>
            )}
            <View style={styles.featuresContainer}>
              {renderFeature(
                "message-text",
                "Nhắn tin với huấn luyện viên",
                pkg.can_message_coach
              )}
              {renderFeature(
                "account-tie",
                "Chỉ định huấn luyện viên riêng",
                pkg.can_assign_coach
              )}
              {renderFeature(
                "notebook",
                "Sử dụng kế hoạch bỏ thuốc",
                pkg.can_use_quitplan
              )}
              {renderFeature(
                "bell",
                "Thiết lập nhắc nhở",
                pkg.can_use_reminder
              )}
              {renderFeature(
                "medal",
                "Kiếm huy hiệu đặc biệt",
                pkg.can_earn_special_badges
              )}
            </View>
            {isCurrentPackage ? (
              // Gói hiện tại - không hiển thị action buttons
              <View style={styles.currentPackageActions}>
                <Text style={styles.currentPackageText}>
                  Gói đang hoạt động
                </Text>
              </View>
            ) : (
              // Hiển thị button chọn gói cho gói khác
              <TouchableOpacity
                style={[styles.selectButton, isUpgrade && styles.upgradeButton]}
                onPress={() => {
                  if (pkg.name === "default") {
                    // Gói Default - chuyển về Home
                    navigation.navigate("Main", { screen: "HomeTab" });
                  } else if (isUpgrade) {
                    // Có thể upgrade - hiển thị dialog upgrade
                    Alert.alert(
                      "Nâng cấp gói",
                      `Bạn muốn nâng cấp từ "${currentMembership.package_id?.name}" lên "${pkg.name}"?\n\nBackend sẽ tự động tính toán và trừ tiền dựa trên gói cũ.`,
                      [
                        { text: "Hủy", style: "cancel" },
                        {
                          text: "Nâng cấp",
                          onPress: () => {
                            // Sử dụng payment flow thay vì upgrade API
                            openPaymentModal(pkg);
                          },
                        },
                      ]
                    );
                  } else {
                    // Không có gói - mở payment modal
                    openPaymentModal(pkg);
                  }
                }}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    isUpgrade && styles.upgradeButtonText,
                  ]}
                >
                  {pkg.name === "default"
                    ? "Chọn gói miễn phí"
                    : isUpgrade
                    ? "Nâng cấp gói"
                    : "Chọn gói này"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => navigation.navigate("Main", { screen: "HomeTab" })}
      >
        <Text style={styles.nextButtonText}>Skip (Comback to Home)</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isPaymentModalVisible}
        onRequestClose={() => {
          setPaymentModalVisible(!isPaymentModalVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Xác nhận gói{" "}
              {selectedPackageForPayment?.name === "default"
                ? "Mặc định"
                : selectedPackageForPayment?.name.toUpperCase()}
            </Text>

            {selectedPackageForPayment && (
              <View style={styles.modalDetailsContainer}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>
                    {selectedPackageForPayment.duration_days / 30} tháng
                  </Text>
                  <Text style={styles.modalDetailValue}>
                    Mỗi tháng: {selectedPackageMonthlyPrice.toLocaleString()} đ
                  </Text>
                </View>
                {savingsPercentage > 0 && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Tổng cộng</Text>
                    <Text style={styles.modalDetailValue}>
                      Tiết kiệm {savingsPercentage}% (
                      {savingsAmount.toLocaleString()} đ)
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Text style={styles.modalPrice}>
              Tổng cộng: {selectedPackageForPayment?.price.toLocaleString()} VND
            </Text>

            <Text style={styles.paymentMethodLabel}>
              Chọn phương thức thanh toán
            </Text>
            <View style={styles.paymentMethodPickerWrapper}>
              <Picker
                selectedValue={selectedPaymentMethod}
                onValueChange={(itemValue) =>
                  setSelectedPaymentMethod(itemValue)
                }
                style={styles.paymentMethodPicker}
                itemStyle={styles.paymentMethodPickerItem}
              >
                <Picker.Item label="PayPal" value="paypal" />
                <Picker.Item label="Momo" value="momo" />
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleSubscribe}
            >
              <Text style={styles.subscribeButtonText}>Đăng ký</Text>
            </TouchableOpacity>

            <Text style={styles.cancelText}>
              Miễn phí hủy bỏ bất cứ lúc nào
            </Text>
            <Text style={styles.infoText}>
              Đăng ký của bạn sẽ tự động gia hạn trừ khi bị hủy. Bạn có thể quản
              lý và hủy đăng ký trong cài đặt App Store của mình.
            </Text>
            <Text style={styles.termsText}>
              Bằng cách tiếp tục, bạn đồng ý với{" "}
              <Text style={styles.linkText}>Điều khoản dịch vụ</Text>
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: "#F4F6FB",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6FB",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#6C63FF",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 17,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#22223B",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    color: "#4A4E69",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 25,
  },
  currentMembershipCard: {
    backgroundColor: "#E8F5E8",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#4ECB71",
  },
  currentMembershipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  currentMembershipTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E7D32",
    marginLeft: 8,
  },
  currentMembershipName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E7D32",
    marginBottom: 4,
  },
  currentMembershipStatus: {
    fontSize: 16,
    color: "#388E3C",
    fontWeight: "600",
    marginBottom: 2,
  },
  currentMembershipExpire: {
    fontSize: 14,
    color: "#689F38",
    fontStyle: "italic",
  },
  packageCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 18,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: "#E0E4F7",
  },
  proPackageCard: {
    borderColor: "#FFD700",
    borderWidth: 2.5,
    shadowColor: "#FFD700",
    shadowOpacity: 0.18,
    elevation: 12,
    backgroundColor: "#FFF9E5",
  },
  currentPackageCard: {
    borderColor: "#4ECB71",
    borderWidth: 2.5,
    backgroundColor: "#F0F9F0",
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  packageName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#22223B",
  },
  proPackageName: {
    color: "#FFD700",
    textShadowColor: "#FFF3B0",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  currentBadge: {
    backgroundColor: "#4ECB71",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  upgradeBadge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upgradeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  packageDescription: {
    fontSize: 16,
    color: "#4A4E69",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  packagePrice: {
    fontSize: 26,
    fontWeight: "900",
    color: "#6C63FF",
    marginBottom: 2,
  },
  packageDuration: {
    fontSize: 15,
    color: "#868E96",
    marginBottom: 10,
    fontStyle: "italic",
  },
  featuresContainer: {
    marginBottom: 18,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  featureIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 15,
    color: "#495057",
    fontWeight: "500",
  },
  selectButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 8,
  },
  currentPackageButton: {
    backgroundColor: "#BDBDBD",
    shadowColor: "#BDBDBD",
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  currentPackageButtonText: {
    color: "#666",
  },
  nextButton: {
    backgroundColor: "#BDBDBD",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
    marginTop: 28,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  noPackagesContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },
  noPackagesText: {
    fontSize: 19,
    color: "#888",
    textAlign: "center",
    lineHeight: 28,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(44, 62, 80, 0.18)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    width: "92%",
    maxWidth: 340,
    alignSelf: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#22223B",
    marginBottom: 18,
    textAlign: "center",
  },
  modalDetailsContainer: {
    width: "100%",
    marginBottom: 15,
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalDetailLabel: {
    fontSize: 15,
    color: "#555",
    fontWeight: "500",
    textAlign: "left",
  },
  modalDetailValue: {
    fontSize: 15,
    color: "#2C3E50",
    fontWeight: "700",
    textAlign: "right",
  },
  modalPrice: {
    fontSize: 25,
    fontWeight: "900",
    color: "#6C63FF",
    marginBottom: 18,
    marginTop: 12,
    textAlign: "center",
  },
  paymentMethodLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#34495E",
    marginBottom: 10,
    marginTop: 20,
    textAlign: "left",
  },
  paymentMethodPickerWrapper: {
    borderWidth: 1,
    borderColor: "#D1D9E6",
    borderRadius: 10,
    backgroundColor: "#FDFDFD",
    marginBottom: 15,
    width: "100%",
    height: 65,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  paymentMethodPicker: {
    height: Platform.OS === "ios" ? 150 : 65,
    width: "100%",
    color: "#2C3E50",
    paddingLeft: 15,
    textAlign: "left",
  },
  paymentMethodPickerItem: {
    fontSize: 16,
    height: 65,
    textAlign: "left",
  },
  subscribeButton: {
    backgroundColor: "#48CAE4",
    paddingVertical: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#48CAE4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 18,
  },
  subscribeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cancelText: {
    fontSize: 13,
    color: "#888",
    marginTop: 15,
    marginBottom: 5,
  },
  currentPackageActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  currentPackageText: {
    color: "#4ECB71",
    fontSize: 16,
    fontWeight: "600",
    fontStyle: "italic",
  },
  cancelButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  upgradeButton: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 11,
    color: "#777",
    textAlign: "left",
    marginBottom: 3,
    lineHeight: 16,
  },
  termsText: {
    fontSize: 11,
    color: "#777",
    textAlign: "left",
    lineHeight: 16,
  },
  linkText: {
    color: "#6C63FF",
    fontWeight: "700",
  },
});

export default MembershipPackageScreen;
