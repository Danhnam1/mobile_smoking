import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useAuth } from "../contexts/AuthContext";
import {getDashboard} from "../api/admin"
import { SafeAreaView } from "react-native";
export default function CoachDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    getDashboard(token)
      .then((res) => {
        console.log("Dashboard API response:", res);
        const statsWithIcon = (res?.stats || []).map((s) => ({
          ...s,
          icon:
            s.title === "Total Users"
              ? "users"
              : s.title === "Active Memberships"
              ? "credit-card"
              : s.title === "Active Coaches"
              ? "check-circle"
              : "award",
          color: s.title === "Total Users"
            ? "#3b82f6"
            : s.title === "Active Memberships"
            ? "#10b981"
            : s.title === "Active Coaches"
            ? "#8b5cf6"
            : "#f97316"
        }));
        setStats(statsWithIcon);
        setActivities(res?.recentActivities || []);
      })
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
      });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back! Here's what's happening today.</Text>
            </View>
        </View>

        <View style={styles.statGrid}>
            {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
                <View style={styles.statHeader}>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <View style={[styles.statIconWrap, { backgroundColor: stat.color + "20" }]}>
                    <Icon name={stat.icon} size={18} color={stat.color} />
                </View>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <View style={styles.statTrend}>
                <Icon
                    name={stat.trend === "up" ? "trending-up" : "trending-down"}
                    size={14}
                    color={stat.trend === "up" ? "#10b981" : "#ef4444"}
                />
                <Text style={{ color: stat.trend === "up" ? "#10b981" : "#ef4444", marginLeft: 4 }}>
                    {stat.change}
                </Text>
                <Text style={styles.statTrendNote}>from last month</Text>
                </View>
            </View>
            ))}
        </View>

        <View style={styles.activityCard}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {activities.length === 0 ? (
            <Text style={styles.emptyText}>No recent activities recorded.</Text>
            ) : (
            activities.map((item, idx) => (
                <View key={idx} style={styles.activityItem}>
                <View style={styles.activityContent}>
                    <View
                    style={[
                        styles.statusDot,
                        {
                        backgroundColor:
                            item.status === "success"
                            ? "#10b981"
                            : item.status === "pending"
                            ? "#facc15"
                            : "#3b82f6"
                        }
                    ]}
                    />
                    <View>
                    <Text style={styles.activityText}>
                        {item.user && <Text style={{ fontWeight: "bold" }}>{item.user}</Text>}
                        : {item.message}
                    </Text>
                    <Text style={styles.activityTime}>
                        {new Date(item.time).toLocaleString()}
                    </Text>
                    </View>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{item.status}</Text>
                </View>
                </View>
            ))
            )}
        </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 14, color: "#555", marginTop: 4 },
  headerButtons: { flexDirection: "row" },
  button: { flexDirection: "row", alignItems: "center", marginLeft: 8, padding: 6, borderWidth: 1, borderRadius: 6 },
  buttonText: { marginLeft: 4 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: { width: "48%", backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 12 },
  statHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statTitle: { fontSize: 14 },
  statIconWrap: { padding: 6, borderRadius: 6 },
  statValue: { fontSize: 20, fontWeight: "bold", marginTop: 8 },
  statTrend: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  statTrendNote: { fontSize: 12, color: "#888", marginLeft: 4 },
  activityCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  emptyText: { color: "#888", fontSize: 14 },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Cho badge nằm phía trên cùng
    marginBottom: 8,
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  activityText: { fontSize: 14 },
  activityTime: { fontSize: 12, color: "#888" },
  statusBadge: {
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
  statusBadgeText: { fontSize: 12 },
});
