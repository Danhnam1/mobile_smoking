import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CurrentMembershipCard = ({
  currentMembership,
  onUpgradeMembership,
  packages,
}) => {
  if (!currentMembership) return null;

  const getRemainingDays = () => {
    if (!currentMembership.expire_date) return "Vĩnh viễn";

    const expireDate = new Date(currentMembership.expire_date);
    const now = new Date();
    const diffTime = expireDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Đã hết hạn";
    if (diffDays === 1) return "1 ngày";
    return `${diffDays} ngày`;
  };

  const getUpgradeOptions = () => {
    if (!packages) return [];

    return packages.filter(
      (pkg) =>
        pkg._id !== currentMembership.package_id?._id && pkg.name !== "default"
    );
  };

  const upgradeOptions = getUpgradeOptions();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="star" size={24} color="#FFD700" />
        <Text style={styles.title}>Gói hiện tại</Text>
      </View>

      <View style={styles.membershipInfo}>
        <Text style={styles.packageName}>
          {currentMembership.package_id?.name || currentMembership.package_name}
        </Text>
        <Text style={styles.status}>
          Trạng thái: <Text style={styles.activeStatus}>Đang hoạt động</Text>
        </Text>
        <Text style={styles.expiry}>
          Còn lại:{" "}
          <Text style={styles.remainingDays}>{getRemainingDays()}</Text>
        </Text>
      </View>

      <View style={styles.actions}>
        {upgradeOptions.length > 0 && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => {
              if (upgradeOptions.length === 1) {
                onUpgradeMembership(upgradeOptions[0]._id);
              } else {
                // Hiển thị dialog chọn gói upgrade
                Alert.alert(
                  "Nâng cấp gói",
                  "Chọn gói muốn nâng cấp:",
                  upgradeOptions
                    .map((pkg) => ({
                      text: pkg.name,
                      onPress: () => onUpgradeMembership(pkg._id),
                    }))
                    .concat([{ text: "Hủy", style: "cancel" }])
                );
              }
            }}
          >
            <Ionicons name="arrow-up-circle" size={20} color="#fff" />
            <Text style={styles.upgradeButtonText}>
              {upgradeOptions.length === 1 ? "Nâng cấp" : "Nâng cấp gói"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 8,
  },
  membershipInfo: {
    marginBottom: 20,
  },
  packageName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6C63FF",
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  activeStatus: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  expiry: {
    fontSize: 14,
    color: "#666",
  },
  remainingDays: {
    color: "#FF9800",
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CurrentMembershipCard;
