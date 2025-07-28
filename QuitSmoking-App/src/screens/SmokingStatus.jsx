import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createSmokingStatusInitial } from "../api/user";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { getLatestPrePlanStatus } from "../api/quitPlan";

const SmokingStatus = ({ navigation, route }) => {
  const [cigaretteCount, setCigaretteCount] = useState("");
  const [suctionFrequency, setSuctionFrequency] = useState("");
  const [healthNote, setHealthNote] = useState("");
  const [pricePerPack, setPricePerPack] = useState("");
  const [packsPerWeek, setPacksPerWeek] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("0");
  const [annualCosts, setAnnualCosts] = useState("0");
  const [cigarettesPerYear, setCigarettesPerYear] = useState("0");
  const [goal, setGoal] = useState(route.params?.goal || "");
  const [existingData, setExistingData] = useState(null);

  const { user, token, updateUserProfile } = useAuth();

  // Add console.log to inspect user and token when component mounts or re-renders
  React.useEffect(() => {}, [user, token]);

  // Load existing data when component mounts
  React.useEffect(() => {
    if (user && token) {
      loadExistingData();
    }
  }, [user, token]);

  // Update goal when route params change
  React.useEffect(() => {
    console.log("SmokingStatus - Route params:", route.params);
    console.log("SmokingStatus - Goal from route params:", route.params?.goal);
    if (route.params?.goal) {
      console.log("SmokingStatus - Setting goal to:", route.params.goal);
      setGoal(route.params.goal);
    }
  }, [route.params?.goal]);

  // Add auto-calculate suctionFrequency
  React.useEffect(() => {
    const count = parseInt(cigaretteCount);
    if (!isNaN(count)) {
      if (count <= 5) setSuctionFrequency("light");
      else if (count <= 15) setSuctionFrequency("medium");
      else setSuctionFrequency("heavy");
    } else {
      setSuctionFrequency("");
    }
  }, [cigaretteCount]);

  // Add calculation for monthly/annual costs and cigarettes/year
  React.useEffect(() => {
    const numCigarettesPerDay = parseFloat(cigaretteCount) || 0;
    const numPricePerPack = parseFloat(pricePerPack) || 0;
    const numPacksPerWeek = parseFloat(packsPerWeek) || 0;

    const monthly = numPacksPerWeek * numPricePerPack * 4.345; // 1 month ~ 4.345 weeks
    const annual = monthly * 12;
    const yearlyCigs = numCigarettesPerDay * 365;

    setMonthlyExpenses(
      monthly.toLocaleString("vi-VN", { minimumFractionDigits: 2 })
    );
    setAnnualCosts(
      annual.toLocaleString("vi-VN", { minimumFractionDigits: 2 })
    );
    setCigarettesPerYear(
      yearlyCigs.toLocaleString("vi-VN", { maximumFractionDigits: 0 })
    );
  }, [cigaretteCount, pricePerPack, packsPerWeek]);

  const loadExistingData = async () => {
    try {
      const data = await getLatestPrePlanStatus(token);
      if (data) {
        setExistingData(data);
        setCigaretteCount(data.cigarette_count?.toString() || "");
        setPricePerPack(data.price_per_pack?.toString() || "");
        setPacksPerWeek(data.packs_per_week?.toString() || "");
        setSuctionFrequency(data.suction_frequency || "medium");
        setHealthNote(data.health_note || "");
        // Note: goal is not loaded from smoking status, only from route params
      }
    } catch (error) {
      console.log("No existing smoking status found");
    }
  };

  const handleSubmit = async () => {
    if (!user || !token) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy ID người dùng hoặc token. Vui lòng đăng nhập lại."
      );
      return;
    }

    const userId = user._id;

    const moneySavedPerDay = (Number(pricePerPack) * Number(packsPerWeek)) / 7;
    const moneySaved = moneySavedPerDay * 30; // Calculate for 30 days

    try {
      // Save smoking status (without goal - goal will be saved in quit plan)
      await createSmokingStatusInitial(
        {
          user_id: userId,
          record_date: new Date().toISOString(),
          cigarette_count: Number(cigaretteCount),
          time_of_smoking: new Date().toISOString(),
          money_spent: moneySavedPerDay,
          suction_frequency: suctionFrequency,
          health_note: healthNote,
          price_per_pack: Number(pricePerPack),
          packs_per_week: Number(packsPerWeek),
          // Note: goal is not saved in smoking status, it will be saved in quit plan
        },
        token
      );

      const cigarettesAvoided = Number(cigaretteCount) * 30;

      await updateUserProfile({
        cigarettesAvoided,
        moneySaved,
        smokingData: {
          cigaretteCount: Number(cigaretteCount),
          suctionFrequency,
          pricePerPack: Number(pricePerPack),
          packsPerWeek: Number(packsPerWeek),
          healthNote,
          // Note: goal is not saved in user profile, it will be saved in quit plan
          lastUpdated: new Date().toISOString(),
        },
        // We will set isProfileComplete to true in ProgressSummary to ensure the flow
        // isProfileComplete: true
      });

      // Check if this is part of quit plan flow
      if (route.params?.fromQuitPlan) {
        // Navigate to QuitPlanScreen with goal
        console.log(
          "SmokingStatus - Navigating to QuitPlanScreen with goal:",
          route.params.goal
        );
        console.log("SmokingStatus - Current goal state:", goal);
        navigation.navigate("QuitPlanScreen", { goal: route.params.goal });
      } else {
        // Navigate to ProgressSummary, passing the calculated values
        navigation.navigate("ProgressSummary", {
          cigarettesAvoided,
          moneySaved,
        });
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Tạo trạng thái hút thuốc thất bại!");
    }
  };

  // Add isFormValid and disable button if not valid
  const isFormValid = () => {
    return (
      cigaretteCount &&
      suctionFrequency &&
      pricePerPack &&
      packsPerWeek &&
      goal.trim()
    );
  };

  return (
    <LinearGradient colors={["#e8fce8", "#fff"]} style={styles.gradientBg}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={styles.titleRow}>
            <Text style={styles.setupTitle}>Thiết lập hồ sơ</Text>
          </View>
          <View style={styles.titleUnderline} />
          <Text style={styles.stepText}>Bước 2/3</Text>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
        </View>
        <View style={styles.container}>
          <Text style={styles.header}>🚬 Thông tin hút thuốc</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mục tiêu của bạn *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="VD: Bỏ thuốc hoàn toàn, Giảm dần..."
                value={goal}
                onChangeText={setGoal}
                placeholderTextColor="#B0B3B8"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Số điếu thuốc hút mỗi ngày *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="VD: 10"
                keyboardType="numeric"
                value={cigaretteCount}
                onChangeText={setCigaretteCount}
                placeholderTextColor="#B0B3B8"
              />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tần suất hút (light/medium/heavy)</Text>
            <View style={styles.inputWrapper}>
              <Text
                style={{ fontSize: 16, color: "#222", paddingVertical: 10 }}
              >
                {suctionFrequency
                  ? suctionFrequency === "light"
                    ? "Nhẹ (light)"
                    : suctionFrequency === "medium"
                    ? "Trung bình (medium)"
                    : "Nặng (heavy)"
                  : "Chưa xác định"}
              </Text>
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Giá 1 gói thuốc (VND)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="VD: 25000"
                keyboardType="numeric"
                value={pricePerPack}
                onChangeText={setPricePerPack}
                placeholderTextColor="#B0B3B8"
              />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Số gói mỗi tuần</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="VD: 5"
                keyboardType="numeric"
                value={packsPerWeek}
                onChangeText={setPacksPerWeek}
                placeholderTextColor="#B0B3B8"
              />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ghi chú sức khỏe</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Nhập ghi chú sức khỏe (tuỳ chọn)"
                value={healthNote}
                onChangeText={setHealthNote}
                placeholderTextColor="#B0B3B8"
                multiline
              />
            </View>
          </View>
          <View style={styles.summaryCard}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Chi phí/tháng</Text>
              <Text style={styles.summaryValue}>{monthlyExpenses} VNĐ</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Chi phí/năm</Text>
              <Text style={styles.summaryValue}>{annualCosts} VNĐ</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Điếu/năm</Text>
              <Text style={styles.summaryValue}>{cigarettesPerYear}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.button, { opacity: isFormValid() ? 1 : 0.5 }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={!isFormValid()}
          >
            <LinearGradient
              colors={["#b9f6ca", "#43e97b"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Tiếp theo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={styles.motivation}>
          Bạn đang thực hiện một quyết định tuyệt vời cho sức khỏe và tương lai
          của mình!
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingVertical: 32,
  },
  topSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  setupTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#1b5e20",
    textAlign: "center",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.08)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  titleUnderline: {
    alignSelf: "center",
    width: 60,
    height: 3,
    backgroundColor: "#43e97b",
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 8,
    opacity: 0.8,
  },
  stepText: {
    fontSize: 15,
    color: "#43e97b",
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  progressBarBg: {
    width: 260,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "66%",
    height: 8,
    backgroundColor: "#43e97b",
    borderRadius: 8,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 30,
    marginHorizontal: 18,
    marginBottom: 18,
    shadowColor: "#43e97b",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 8,
    alignItems: "stretch",
  },
  header: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 28,
    textAlign: "center",
    color: "#27ae60",
    letterSpacing: 0.2,
  },
  formGroup: {
    marginBottom: 22,
  },
  label: {
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 14,
    color: "#388e3c",
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6fff8",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#b2dfdb",
    paddingHorizontal: 14,
    marginTop: 2,
    shadowColor: "#43e97b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    height: Platform.OS === "ios" ? 40 : 44,
    fontSize: 17,
    color: "#222",
    backgroundColor: "transparent",
    borderWidth: 0,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  pickerFullWidth: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    marginTop: 4,
    marginBottom: 2,
    alignSelf: "center",
    minWidth: 200,
  },
  picker: {
    height: 52,
    width: "100%",
    minWidth: 200,
    color: "#222",
    backgroundColor: "transparent",
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 10,
    backgroundColor: "#e0f7fa",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#43e97b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryBox: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    color: "#388e3c",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 2,
  },
  summaryValue: {
    fontWeight: "bold",
    color: "#1b5e20",
    fontSize: 16,
  },
  button: {
    borderRadius: 24,
    marginTop: 28,
    overflow: "hidden",
    elevation: 4,
    alignSelf: "center",
    width: "100%",
    shadowColor: "#43e97b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 24,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 19,
    letterSpacing: 0.2,
  },
  motivation: {
    marginTop: 18,
    color: "#A0A4AA",
    textAlign: "center",
    fontSize: 14,
    marginHorizontal: 32,
    fontStyle: "italic",
    fontWeight: "500",
  },
});

export default SmokingStatus;
