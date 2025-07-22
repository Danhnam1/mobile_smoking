import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { CoachUserService } from "../api/coachuser";
import Icon from "react-native-vector-icons/Feather";
import { useAuth } from "../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context"; // 👈 quan trọng

const statusColor = {
  ongoing: { backgroundColor: "#FEF3C7", color: "#92400E" },
  completed: { backgroundColor: "#D1FAE5", color: "#065F46" },
  not_started: { backgroundColor: "#E5E7EB", color: "#374151" },
};

const CoachUserDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;
  const { token } = useAuth();

  const [relation, setRelation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CoachUserService.getById(token, userId)
      .then((res) => {
        setRelation(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy chi tiết người dùng:", err);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  if (!relation) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "red" }}>Không tìm thấy thông tin người dùng.</Text>
      </SafeAreaView>
    );
  }

  const { coach_id, user_id, status, created_at, quitPlans } = relation;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={18} color="#2563eb" />
          <Text style={styles.backText}>Trở lại</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Chi tiết khách hàng</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Khách hàng:</Text>
          <Text style={styles.text}>{user_id?.full_name}</Text>
          <Text style={styles.subtext}>{user_id?.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Coach:</Text>
          <Text style={styles.text}>{coach_id?.full_name}</Text>
          <Text style={styles.subtext}>{coach_id?.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Trạng thái gán:</Text>
          <Text style={[styles.status, statusColor[status] || {}]}>{status}</Text>
          <Text style={styles.subtext}>
            {created_at ? new Date(created_at).toLocaleDateString() : "Không rõ ngày"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Kế hoạch bỏ thuốc</Text>
        {quitPlans?.length > 0 ? (
          quitPlans.map((plan) => (
            <View key={plan._id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>
                  {plan.goal?.replace("_", " ").toUpperCase()}
                </Text>
                <Text style={[styles.statusSmall, statusColor[plan.status] || {}]}>
                  {plan.status?.replace("_", " ")}
                </Text>
              </View>
              <Text style={styles.planNote}>{plan.note || "Không có ghi chú"}</Text>
              <Text style={styles.planSub}>
                Bắt đầu: {new Date(plan.start_date).toLocaleDateString()}
              </Text>

              {plan.reasons?.length > 0 && (
                <Text style={styles.planSub}>Lý do: {plan.reasons.join(", ")}</Text>
              )}
              {plan.reasons_detail && (
                <Text style={styles.planSub}>Chi tiết lý do: {plan.reasons_detail}</Text>
              )}

              <View style={styles.stageBlock}>
                <Text style={styles.stageTitle}>Các giai đoạn:</Text>
                {plan.stages?.length > 0 ? (
                  plan.stages.map((stage) => (
                    <View key={stage._id} style={styles.stageItem}>
                      <View style={styles.stageRow}>
                        <Text style={styles.stageName}>{stage.name}</Text>
                        <Text style={[styles.statusTiny, statusColor[stage.status] || {}]}>
                          {stage.status?.replace("_", " ")}
                        </Text>
                      </View>
                      <Text style={styles.stageDesc}>{stage.description}</Text>
                      <Text style={styles.stageTime}>
                        {new Date(stage.start_date).toLocaleDateString()} →{" "}
                        {new Date(stage.end_date).toLocaleDateString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noStage}>Không có giai đoạn nào</Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noPlans}>Không có kế hoạch nào.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backText: {
    marginLeft: 6,
    color: "#2563eb",
    fontWeight: "500",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    color: "#4b5563",
    fontWeight: "600",
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  subtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  status: {
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1d4ed8",
  },
  statusSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },
  planNote: {
    fontSize: 13,
    color: "#4b5563",
  },
  planSub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  stageBlock: {
    marginTop: 8,
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  stageItem: {
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  stageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stageName: {
    fontWeight: "bold",
    color: "#111827",
  },
  statusTiny: {
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  stageDesc: {
    fontSize: 12,
    color: "#374151",
    marginTop: 2,
  },
  stageTime: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  noPlans: {
    color: "#9ca3af",
    fontStyle: "italic",
    marginTop: 12,
  },
  noStage: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
});

export default CoachUserDetail;
