import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const formatMoney = (value) => {
  if (value === undefined || value === null) return "Chưa cập nhật";
  const numericValue = Math.round(Number(value));
  return numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const ProfileScreen = ({ navigation }) => {
  const { user, membershipStatus } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Đang tải thông tin người dùng...</Text>
      </SafeAreaView>
    );
  }

  // Default values if data is not yet set in user profile
  const cigarettesAvoided = user.cigarettesAvoided || 0;
  const moneySaved = user.moneySaved || 0;

  // Helper to format date for display
  const formattedBirthDate = user.birth_date
    ? new Date(user.birth_date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Chưa cập nhật";

  const renderInfoRow = (iconType, iconName, label, value) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrapper}>
        {iconType === "Ionicons" ? (
          <Ionicons name={iconName} size={24} color="#222" />
        ) : (
          <MaterialCommunityIcons name={iconName} size={24} color="#222" />
        )}
      </View>
      <View style={styles.infoTextWrapper}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={["#e8fce8", "#fff"]} style={styles.gradientBg}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Main", { screen: "HomeTab" })}
              style={styles.backButtonContainer}
            >
              <Ionicons name="arrow-back-outline" size={28} color="#27ae60" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrapper}>
              <Text style={styles.title}>Hồ sơ cá nhân</Text>
            </View>
            <View style={styles.headerRightSpacer} />
          </View>

          {/* Avatar, Name, Email */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <Ionicons name="person-circle" size={110} color="#b9f6ca" />
              )}
            </View>
            <Text style={styles.name}>{user.full_name || "Chưa cập nhật"}</Text>
            <Text style={styles.email}>{user.email || "Chưa cập nhật"}</Text>
          </View>

          {/* Thông tin cá nhân */}
          <View style={styles.card}>
            <View style={styles.cardHeaderWithEdit}>
              <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("UserDetailScreen", {
                    fromProfileEdit: true,
                  })
                }
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={22}
                  color="#222"
                />
              </TouchableOpacity>
            </View>
            {renderInfoRow(
              "Ionicons",
              "calendar-outline",
              "Ngày sinh",
              formattedBirthDate
            )}
            {renderInfoRow(
              "MaterialCommunityIcons",
              "gender-male-female",
              "Giới tính",
              user.gender || "Chưa cập nhật"
            )}
          </View>

          {/* Thông tin hút thuốc */}
          <View style={styles.card}>
            <View style={styles.cardHeaderWithEdit}>
              <Text style={styles.cardTitle}>Tình trạng hút thuốc</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("SmokingStatus")}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={22}
                  color="#222"
                />
              </TouchableOpacity>
            </View>
            {renderInfoRow(
              "MaterialCommunityIcons",
              "smoke",
              "Số điếu tránh được",
              `${cigarettesAvoided} điếu`
            )}
            {renderInfoRow(
              "MaterialCommunityIcons",
              "cash-multiple",
              "Tiền sẽ tiết kiệm",
              `${formatMoney(moneySaved)} VNĐ`
            )}
            {renderInfoRow(
              "MaterialCommunityIcons",
              "numeric",
              "Điếu/ngày trước đây",
              user.smokingData?.cigaretteCount
                ? `${user.smokingData.cigaretteCount} điếu`
                : "Chưa cập nhật"
            )}
            {renderInfoRow(
              "MaterialCommunityIcons",
              "currency-usd",
              "Giá 1 bao",
              user.smokingData?.pricePerPack
                ? `${formatMoney(user.smokingData.pricePerPack)} VNĐ`
                : "Chưa cập nhật"
            )}
            {renderInfoRow(
              "MaterialCommunityIcons",
              "package-variant",
              "Gói/tuần",
              user.smokingData?.packsPerWeek
                ? `${user.smokingData.packsPerWeek} gói`
                : "Chưa cập nhật"
            )}
            {renderInfoRow(
              "MaterialCommunityIcons",
              "speedometer",
              "Tần suất hút",
              user.smokingData?.suctionFrequency
                ? user.smokingData.suctionFrequency === "light"
                  ? "Nhẹ"
                  : user.smokingData.suctionFrequency === "medium"
                  ? "Trung bình"
                  : "Nặng"
                : "Chưa cập nhật"
            )}
            {user.smokingData?.healthNote &&
              renderInfoRow(
                "MaterialCommunityIcons",
                "note-text-outline",
                "Ghi chú sức khỏe",
                user.smokingData.healthNote
              )}
          </View>

          {/* Gói thành viên */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gói thành viên</Text>
            {membershipStatus && membershipStatus.status === "active" ? (
              <>
                {renderInfoRow(
                  "Ionicons",
                  "star",
                  "Trạng thái gói",
                  membershipStatus.package_name
                    ? membershipStatus.package_name.toUpperCase()
                    : "Pro"
                )}
                {renderInfoRow(
                  "MaterialCommunityIcons",
                  "calendar-check",
                  "Ngày hết hạn",
                  new Date(membershipStatus.expire_date).toLocaleDateString(
                    "vi-VN"
                  )
                )}
              </>
            ) : (
              renderInfoRow(
                "Ionicons",
                "star-outline",
                "Trạng thái gói",
                "Chưa có gói"
              )
            )}

            {membershipStatus?.status !== "active" && (
              <TouchableOpacity
                style={styles.membershipButton}
                onPress={() => navigation.navigate("MembershipPackage")}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#43e97b", "#27ae60"]}
                  style={styles.membershipButtonGradient}
                >
                  <Text style={styles.membershipButtonText}>
                    Xem/Nâng cấp gói
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => navigation.navigate("TransactionsScreen")}
              activeOpacity={0.85}
            >
              <Text style={styles.historyButtonText}>Lịch sử giao dịch</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContainer: {
    padding: 0,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 18,
    marginTop: 10,
    marginBottom: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "900",
    color: "#27ae60",
    letterSpacing: 1,
  },
  loadingText: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    color: "#222",
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
    width: "100%",
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222",
    marginTop: 10,
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 15,
    color: "#444",
    marginTop: 2,
    marginBottom: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    marginBottom: 22,
    width: "90%",
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "black",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingVertical: 2,
  },
  infoIconWrapper: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrapper: {
    flex: 1,
    marginLeft: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 17,
    color: "#27ae60",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  membershipButton: {
    borderRadius: 18,
    marginTop: 18,
    overflow: "hidden",
    width: "100%",
    alignSelf: "center",
    elevation: 3,
  },
  membershipButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 18,
    width: "100%",
  },
  membershipButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  historyButton: {
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 14,
    width: "100%",
    alignSelf: "center",
  },
  historyButtonText: {
    color: "#222",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  cardHeaderWithEdit: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  backButtonContainer: {
    padding: 10,
    marginRight: 10,
    zIndex: 1,
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: "center",
  },
  headerRightSpacer: {
    width: 48,
  },
});

export default ProfileScreen;
