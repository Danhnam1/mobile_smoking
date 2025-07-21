import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import {
  getAll,
  markAsRead,
  markAsReadAll,
  deleteAll,
} from "../api/notification";
import { useAuth } from "../contexts/AuthContext";

const NotificationTab = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const res = await getAll(token);
      console.log("notidata>>>>", res);
      setNotifications(res || []);
    } catch (err) {
      setNotifications([]);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const handleMarkAllAsRead = async () => {
    await markAsReadAll(token);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleClearAll = async () => {
    await deleteAll(token);
    setNotifications([]);
  };

  const handleClickItem = async (noti) => {
    if (!noti.is_read) {
      await markAsRead(token, noti._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === noti._id ? { ...n, is_read: true } : n))
      );
    }
    // Có thể mở modal chi tiết tại đây nếu muốn
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, !item.is_read && styles.unread]}
      onPress={() => handleClickItem(item)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.time}>{new Date(item.sent_at).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.headerBtnText}>Đọc tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleClearAll}>
            <Text style={styles.headerBtnText}>Xóa tất</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>Không có thông báo nào</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchNotifications}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // nền nhẹ để item nổi hơn
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerBtn: {
    marginLeft: 8,
    backgroundColor: "#2563eb",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  headerBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  item: {
    backgroundColor: "#fff",
    marginHorizontal: 16, // tạo khoảng cách hai bên
    marginVertical: 6, // khoảng cách giữa các item
    padding: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unread: {
    backgroundColor: "#e0f2fe", // màu xanh nhạt hơn
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
    color: "#111",
  },
  content: {
    fontSize: 15,
    color: "#333",
    marginBottom: 6,
  },
  time: {
    color: "#888",
    fontSize: 13,
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 16,
  },
});

export default NotificationTab;
