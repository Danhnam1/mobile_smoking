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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const GoalScreen = ({ navigation, route }) => {
  const [goal, setGoal] = useState(route.params?.goal || "");

  const handleContinue = () => {
    if (!goal.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mục tiêu của bạn");
      return;
    }

    console.log("GoalScreen - Goal value:", goal);
    console.log("GoalScreen - Goal trimmed:", goal.trim());

    // Navigate to SmokingStatus with goal
    navigation.navigate("SmokingStatus", {
      goal: goal,
      fromQuitPlan: route.params?.fromQuitPlan || false,
    });
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
            <Text style={styles.setupTitle}>Thiết lập mục tiêu</Text>
          </View>
          <View style={styles.titleUnderline} />
          <Text style={styles.stepText}>Bước 1/3</Text>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
        </View>

        <View style={styles.container}>
          <Text style={styles.header}>🎯 Mục tiêu của bạn</Text>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Hãy cho chúng tôi biết mục tiêu của bạn để có thể tạo ra một kế
              hoạch bỏ thuốc phù hợp nhất.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mục tiêu của bạn *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="VD: Bỏ thuốc hoàn toàn, Giảm dần từ 10 điếu xuống 2 điếu/ngày..."
                value={goal}
                onChangeText={setGoal}
                placeholderTextColor="#B0B3B8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Gợi ý mục tiêu:</Text>
            <View style={styles.suggestionItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.suggestionText}>Bỏ thuốc hoàn toàn</Text>
            </View>
            <View style={styles.suggestionItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.suggestionText}>Bỏ vì vợ con</Text>
            </View>
            <View style={styles.suggestionItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.suggestionText}>Vì Sức Khỏe bản thân</Text>
            </View>
            <View style={styles.suggestionItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.suggestionText}>Bỏ thuốc trong 3 tháng</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, { opacity: goal.trim() ? 1 : 0.5 }]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={!goal.trim()}
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
          Mục tiêu rõ ràng là bước đầu tiên quan trọng nhất trên hành trình bỏ
          thuốc!
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
    width: "33%",
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
    marginBottom: 20,
    textAlign: "center",
    color: "#27ae60",
    letterSpacing: 0.2,
  },
  descriptionContainer: {
    marginBottom: 25,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 16,
    color: "#388e3c",
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f6fff8",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#b2dfdb",
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#43e97b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    minHeight: 80,
    fontSize: 16,
    color: "#222",
    backgroundColor: "transparent",
    borderWidth: 0,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  suggestionsContainer: {
    backgroundColor: "#f0f8f0",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#388e3c",
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  button: {
    borderRadius: 24,
    marginTop: 10,
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

export default GoalScreen;
