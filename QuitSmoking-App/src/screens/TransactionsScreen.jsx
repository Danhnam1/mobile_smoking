import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentService } from "../services/payment.service";
import { useFocusEffect } from "@react-navigation/native";

const TransactionItem = ({ item }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionIcon}>
      <Ionicons name="receipt-outline" size={24} color="#007AFF" />
    </View>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionDescription}>
        {item.description || "Thanh toán gói thành viên"}
      </Text>
      <Text style={styles.transactionDate}>
        {new Date(item.created_at).toLocaleString("vi-VN")}
      </Text>
    </View>
    <View style={styles.transactionAmountContainer}>
      <Text
        style={[
          styles.transactionAmount,
          item.amount > 0 ? styles.positiveAmount : {},
        ]}
      >
        {item.amount.toLocaleString("vi-VN")} VND
      </Text>
      <Text style={[styles.transactionStatus, styles[`status_${item.status}`]]}>
        {item.status}
      </Text>
    </View>
  </View>
);

const MembershipItem = ({ item }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#28A745";
      case "expired":
        return "#DC3545";
      case "cancelled":
        return "#6C757D";
      default:
        return "#FFC107";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "expired":
        return "Đã hết hạn";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Chờ xử lý";
    }
  };

  const isExpired = new Date(item.expire_date) < new Date();
  const statusColor = getStatusColor(item.status);
  const statusText = getStatusText(item.status);

  return (
    <View style={styles.membershipItem}>
      <View style={styles.membershipIcon}>
        <Ionicons
          name={item.package_id?.name === "pro" ? "crown" : "shield-checkmark"}
          size={24}
          color={item.package_id?.name === "pro" ? "#FFD700" : "#4ECB71"}
        />
      </View>
      <View style={styles.membershipDetails}>
        <Text style={styles.membershipPackageName}>
          {item.package_id?.name === "default"
            ? "Gói Mặc định"
            : `Gói ${item.package_id?.name?.toUpperCase()}`}
        </Text>
        <Text style={styles.membershipDate}>
          Đăng ký: {new Date(item.payment_date).toLocaleDateString("vi-VN")}
        </Text>
        <Text style={styles.membershipExpire}>
          Hết hạn: {new Date(item.expire_date).toLocaleDateString("vi-VN")}
        </Text>
      </View>
      <View style={styles.membershipStatusContainer}>
        <View
          style={[
            styles.membershipStatusBadge,
            { backgroundColor: `${statusColor}20` },
          ]}
        >
          <Text style={[styles.membershipStatus, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
        {item.package_id?.price > 0 && (
          <Text style={styles.membershipPrice}>
            {item.package_id.price.toLocaleString("vi-VN")} VND
          </Text>
        )}
      </View>
    </View>
  );
};

const TransactionsScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions"); // 'transactions' or 'memberships'

  const fetchTransactions = async () => {
    try {
      const response = await PaymentService.getUserTransactions();
      setTransactions(response || []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const fetchMemberships = async () => {
    try {
      const response = await PaymentService.getMembershipHistory();
      setMemberships(response || []);
    } catch (error) {
      console.error("Failed to fetch memberships:", error);
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([fetchTransactions(), fetchMemberships()]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderTabButton = (tabName, title, icon) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tabName && styles.activeTabButton,
      ]}
      onPress={() => setActiveTab(tabName)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={activeTab === tabName ? "#007AFF" : "#6C757D"}
      />
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tabName && styles.activeTabButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ActivityIndicator style={styles.centered} size="large" color="#007AFF" />
    );
  }

  const currentData = activeTab === "transactions" ? transactions : memberships;
  const isEmpty = currentData.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton("transactions", "Giao dịch", "receipt-outline")}
        {renderTabButton(
          "memberships",
          "Thành viên",
          "shield-checkmark-outline"
        )}
      </View>

      {isEmpty ? (
        <View style={styles.centered}>
          <Ionicons
            name={
              activeTab === "transactions"
                ? "receipt-outline"
                : "shield-checkmark-outline"
            }
            size={64}
            color="#6C757D"
          />
          <Text style={styles.emptyText}>
            {activeTab === "transactions"
              ? "Bạn chưa có giao dịch nào."
              : "Bạn chưa có lịch sử thành viên nào."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) =>
            activeTab === "transactions" ? (
              <TransactionItem item={item} />
            ) : (
              <MembershipItem item={item} />
            )
          }
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#343A40",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
    backgroundColor: "#F8F9FA",
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#6C757D",
  },
  activeTabButtonText: {
    color: "#007AFF",
  },
  listContainer: {
    padding: 10,
  },
  transactionItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  transactionIcon: {
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
  },
  transactionDate: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 4,
  },
  transactionAmountContainer: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  positiveAmount: {
    color: "#28A745",
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  status_success: {
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    color: "#28A745",
  },
  status_failed: {
    backgroundColor: "rgba(220, 53, 69, 0.1)",
    color: "#DC3545",
  },
  status_pending: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    color: "#FFC107",
  },
  membershipItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  membershipIcon: {
    marginRight: 15,
  },
  membershipDetails: {
    flex: 1,
  },
  membershipPackageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 4,
  },
  membershipDate: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 2,
  },
  membershipExpire: {
    fontSize: 12,
    color: "#6C757D",
  },
  membershipStatusContainer: {
    alignItems: "flex-end",
  },
  membershipStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  membershipStatus: {
    fontSize: 11,
    fontWeight: "bold",
  },
  membershipPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#495057",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6C757D",
    marginTop: 16,
    textAlign: "center",
  },
});

export default TransactionsScreen;
