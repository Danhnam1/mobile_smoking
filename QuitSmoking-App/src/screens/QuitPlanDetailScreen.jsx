import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { getQuitPlanById } from "../api/quitPlan";
import { getCoachById } from "../api/user";
import { useAuth } from "../contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const bgImage = require("../../assets/Background.jpg");

const QuitPlanDetailScreen = ({ route, navigation }) => {
  const { planId } = route.params;
  const { token } = useAuth();
  const [plan, setPlan] = useState(null);
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await getQuitPlanById(planId, token);
        setPlan(data);

        // Nếu có coach_user_id, lấy thông tin coach
        if (data.coach_user_id) {
          try {
            const coachData = await getCoachById(data.coach_user_id, token);
            setCoach(coachData);
          } catch (coachError) {
            console.log("Không thể lấy thông tin coach:", coachError.message);
            setCoach(null);
          }
        }
      } catch (error) {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId, token]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (!plan) return <Text style={{ margin: 20 }}>Plan not found</Text>;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return "#4CAF50";
      case "completed":
        return "#2196F3";
      case "cancelled":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ongoing":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <ImageBackground source={bgImage} style={styles.bg} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.centerContent}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={48}
              color="#4CAF50"
            />
          </View>
          <Text style={styles.title}>Your Quit Plan</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Goal:</Text>
            <Text style={styles.value}>{plan.goal}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>{formatDate(plan.start_date)}</Text>
          </View>

          {plan.note && (
            <View style={styles.row}>
              <Text style={styles.label}>Note:</Text>
              <Text style={styles.value}>{plan.note}</Text>
            </View>
          )}

          {plan.reasons && plan.reasons.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Reasons:</Text>
              <View style={{ flex: 1 }}>
                {plan.reasons.map((reason, i) => (
                  <Text key={i} style={styles.reasonItem}>
                    • {reason}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {plan.reasons_detail && (
            <View style={styles.row}>
              <Text style={styles.label}>Detailed Reasons:</Text>
              <Text style={styles.value}>{plan.reasons_detail}</Text>
            </View>
          )}

          {plan.status && (
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text
                style={[styles.value, { color: getStatusColor(plan.status) }]}
              >
                {getStatusText(plan.status)}
              </Text>
            </View>
          )}

          {coach && (
            <View style={styles.row}>
              <Text style={styles.label}>Coach:</Text>
              <View style={styles.coachInfo}>
                <Text style={styles.coachName}>{coach.full_name}</Text>
                <Text style={styles.coachEmail}>{coach.email}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("QuitStage", { planId: plan._id })
            }
          >
            <Text style={styles.buttonText}>View Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate("Main")}
          >
            <Text style={styles.homeButtonText}>Comeback to home screen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
    paddingVertical: 30,
  },
  card: {
    width: "95%",
    backgroundColor: "rgba(255,255,255,0.93)",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 30,
    alignItems: "center",
  },
  iconWrap: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#388e3c",
    marginBottom: 22,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    width: "100%",
  },
  label: {
    minWidth: 110,
    fontWeight: "700",
    color: "#2C3E50",
    fontSize: 16,
    marginRight: 8,
  },
  value: {
    flex: 1,
    color: "#444",
    fontSize: 16,
    fontWeight: "400",
    flexWrap: "wrap",
  },
  reasonItem: {
    color: "#444",
    fontSize: 15,
    marginBottom: 2,
    marginLeft: 2,
  },
  button: {
    marginTop: 18,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: "center",
    shadowColor: "#388e3c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  homeButton: {
    marginTop: 12,
    alignSelf: "center",
  },
  homeButtonText: {
    color: "#gray",
    fontWeight: "bold",
    fontSize: 13,
    opacity: 0.5,
    letterSpacing: 0.5,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  coachEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  coachRole: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
});

export default QuitPlanDetailScreen;
