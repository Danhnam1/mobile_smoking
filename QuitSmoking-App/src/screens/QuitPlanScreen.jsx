import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import {
  createQuitPlan,
  getSuggestedStages,
  saveGoalDraft,
} from "../api/quitPlan";
import { fetchSmokingStatus } from "../api/user";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Coach from "../components/Coach";
import { API_BASE_URL } from "../config/config";
import { useFocusEffect } from "@react-navigation/native";

const QuitPlanScreen = ({ navigation, route }) => {
  const { user, token, membershipStatus } = useAuth();
  const [goal, setGoal] = useState(route.params?.goal || "");
  const [startDate, setStartDate] = useState("");
  const [note, setNote] = useState("");
  const [reasons, setReasons] = useState([""]);
  const [reasonsDetail, setReasonsDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [smokingData, setSmokingData] = useState(null);
  const [suggestedStages, setSuggestedStages] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [customMaxValues, setCustomMaxValues] = useState([]);

  // Debug goal from route params
  useEffect(() => {
    console.log("QuitPlanScreen - Route params:", route.params);
    console.log("QuitPlanScreen - Goal from route params:", route.params?.goal);
    console.log("QuitPlanScreen - Current goal state:", goal);
  }, [route.params, goal]);

  // Update goal when route params change
  useEffect(() => {
    if (route.params?.goal) {
      console.log(
        "QuitPlanScreen - Setting goal from route params:",
        route.params.goal
      );
      setGoal(route.params.goal);
    }
  }, [route.params?.goal]);

  useEffect(() => {
    const loadData = async () => {
      if (user && token) {
        try {
          // Fetch smoking status (for other data, not goal)
          const status = await fetchSmokingStatus(token);
          console.log("Smoking status:", status);
          if (status) {
            setSmokingData(status);
            // Note: goal is not loaded from smoking status, only from route params
          }

          // Get suggested stages
          const stages = await getSuggestedStages(token);
          if (stages && stages.suggested_stages) {
            setSuggestedStages(stages.suggested_stages);
            // Initialize custom max values array
            setCustomMaxValues(
              stages.suggested_stages.map(
                (stage) => stage.max_daily_cigarette?.toString() || ""
              )
            );
          }
        } catch (error) {
          console.error("Error loading data:", error);
        }
      }
    };
    loadData();
  }, [user, token]);

  useFocusEffect(
    React.useCallback(() => {
      // Có thể để trống, chỉ cần để dependency là [membershipStatus]
      // hoặc gọi lại các hàm fetch nếu cần
    }, [membershipStatus])
  );

  // Debug membership status
  useEffect(() => {}, [membershipStatus]);

  const addReason = () => {
    setReasons([...reasons, ""]);
  };

  const updateReason = (text, index) => {
    const newReasons = [...reasons];
    newReasons[index] = text;
    setReasons(newReasons);
  };

  const removeReason = (index) => {
    const newReasons = reasons.filter((_, i) => i !== index);
    setReasons(newReasons);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const selectedDate = new Date(date);
    setStartDate(selectedDate.toISOString().split("T")[0]);
    hideDatePicker();
  };

  const updateCustomMaxValue = (index, value) => {
    const newValues = [...customMaxValues];
    newValues[index] = value;
    setCustomMaxValues(newValues);
  };

  const calculateEndDate = (startDate, stages) => {
    if (!startDate || !stages) return null;

    const start = new Date(startDate);
    let totalDays = 0;

    stages.forEach((stage, index) => {
      const customMax = customMaxValues[index];
      const maxCigarettes = customMax
        ? parseInt(customMax)
        : stage.max_daily_cigarette;

      // Calculate duration based on max cigarettes (similar to backend logic)
      let duration;
      if (maxCigarettes <= 2) {
        duration = 7; // 1 week
      } else if (maxCigarettes <= 5) {
        duration = 14; // 2 weeks
      } else if (maxCigarettes <= 10) {
        duration = 21; // 3 weeks
      } else {
        duration = 28; // 4 weeks
      }

      totalDays += duration;
    });

    const endDate = new Date(start);
    endDate.setDate(start.getDate() + totalDays - 1);
    return endDate.toISOString().split("T")[0];
  };

  const handleCreateQuitPlan = async () => {
    console.log("QuitPlanScreen - handleCreateQuitPlan called");
    console.log("QuitPlanScreen - Current goal state:", goal);
    console.log("QuitPlanScreen - Goal trimmed:", goal?.trim());

    if (!user || !token) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    if (!goal || !goal.trim()) {
      Alert.alert("Error", "Please enter your goal.");
      return;
    }

    if (!startDate) {
      Alert.alert("Error", "Please select a start date.");
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      Alert.alert("Error", "Please enter a valid date in YYYY-MM-DD format");
      return;
    }

    setLoading(true);
    try {
      // First, save goal draft
      console.log("QuitPlanScreen - Saving goal draft:", goal.trim());
      await saveGoalDraft(goal.trim(), token);

      // Then create quit plan (without goal - backend will get it from draft)
      const planData = {
        user_id: user._id,
        start_date: startDate,
        note: note || "",
        reasons: reasons.filter((reason) => reason.trim() !== ""),
        reasons_detail: reasonsDetail || "",
        coach_user_id: selectedCoachId || null,
        custom_max_values: customMaxValues.map((value) =>
          value ? parseInt(value) : null
        ),
      };

      console.log("QuitPlanScreen - Creating quit plan with data:", planData);

      const response = await createQuitPlan(planData, token);

      Alert.alert("Success", "Quit Plan created successfully!");
      navigation.navigate("Main", {
        screen: "QuitStage",
        params: { planId: response.plan._id },
      });
    } catch (error) {
      console.error("QuitPlanScreen - Failed to create quit plan:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to create quit plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const endDate = calculateEndDate(startDate, suggestedStages);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={28} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Quit Plan</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Goal *</Text>
          <TextInput
            style={styles.input}
            placeholder="What is your goal? (e.g., Quit completely, Reduce gradually)"
            value={goal}
            onChangeText={setGoal}
          />

          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity onPress={showDatePicker} style={styles.input}>
            <Text style={{ color: startDate ? "#000" : "#ccc" }}>
              {startDate ? startDate : "YYYY-MM-DD"}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            minimumDate={new Date()}
          />

          {/* Only show stages and end date after start date is selected */}
          {startDate && suggestedStages && (
            <>
              <View style={styles.suggestedStagesContainer}>
                <Text style={styles.sectionTitle}>Suggested Plan Stages</Text>
                {suggestedStages.map((stage, index) => (
                  <View key={index} style={styles.stageItem}>
                    <View style={styles.stageHeader}>
                      <Text style={styles.stageName}>{stage.name}</Text>
                      <View style={styles.stageDateContainer}>
                        <Text style={styles.stageDateLabel}>Duration:</Text>
                        <Text style={styles.stageDateValue}>
                          {(() => {
                            const customMax = customMaxValues[index];
                            const maxCigarettes = customMax
                              ? parseInt(customMax)
                              : stage.max_daily_cigarette;
                            if (maxCigarettes <= 2) return "1 week";
                            if (maxCigarettes <= 5) return "2 weeks";
                            if (maxCigarettes <= 10) return "3 weeks";
                            return "4 weeks";
                          })()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.stageDescription}>
                      {stage.description}
                    </Text>

                    {/* Custom Max Cigarettes Input */}
                    <View style={styles.maxCigarettesContainer}>
                      <Text style={styles.maxCigarettesLabel}>
                        Max cigarettes per day:
                      </Text>
                      <TextInput
                        style={styles.maxCigarettesInput}
                        placeholder={
                          stage.max_daily_cigarette?.toString() || "0"
                        }
                        value={customMaxValues[index]}
                        onChangeText={(value) =>
                          updateCustomMaxValue(index, value)
                        }
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                ))}
              </View>

              {endDate && (
                <View style={styles.endDateContainer}>
                  <Text style={styles.endDateLabel}>Estimated End Date</Text>
                  <Text style={styles.endDateValue}>{endDate}</Text>
                  <Text style={styles.endDateNote}>
                    Based on your custom max cigarettes settings
                  </Text>
                </View>
              )}
            </>
          )}

          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional notes about your quit plan"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
          />

          {/* Reasons Section */}
          <Text style={styles.label}>Reasons for Quitting</Text>
          {reasons.map((reason, index) => (
            <View key={index} style={styles.reasonContainer}>
              <TextInput
                style={[styles.input, styles.reasonInput]}
                placeholder={`Reason ${index + 1}`}
                value={reason}
                onChangeText={(text) => updateReason(text, index)}
              />
              {reasons.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeReason(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addReason}>
            <Ionicons name="add-circle" size={20} color="#4CAF50" />
            <Text style={styles.addButtonText}>Add Reason</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Detailed Reasons</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide more detailed explanation of your motivation to quit"
            value={reasonsDetail}
            onChangeText={setReasonsDetail}
            multiline
            numberOfLines={4}
          />

          {/* Coach Selection for Pro Members */}
          {membershipStatus?.package_id?.type === "pro" ? (
            <>
              <Coach
                setSelectedCoachId={setSelectedCoachId}
                setSelectedCoach={setSelectedCoach}
              />
            </>
          ) : (
            <View style={styles.proFeatureContainer}>
              <Text style={styles.proFeatureTitle}>Tính năng Pro</Text>
              <Text style={styles.proFeatureDescription}>
                Nâng cấp lên gói Pro để chọn coach và tùy chỉnh thông báo
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => navigation.navigate("MembershipPackage")}
              >
                <Text style={styles.upgradeButtonText}>Nâng cấp ngay</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleCreateQuitPlan}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Creating..." : "Create Quit Plan"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  headerRight: {
    width: 28,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  suggestedStagesContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15,
    textAlign: "center",
  },
  stageItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  stageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  stageName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#4CAF50",
  },
  stageDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stageDateLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
  stageDateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  stageDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  maxCigarettesContainer: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  maxCigarettesLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  maxCigarettesInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    height: 55,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 15,
    marginBottom: 20,
  },
  reasonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  reasonInput: {
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    padding: 5,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
  },
  addButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "bold",
  },
  endDateContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  endDateValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
  },
  endDateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 5,
    textAlign: "center",
  },
  endDateNote: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
  },
  proFeatureContainer: {
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
  proFeatureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
    textAlign: "center",
  },
  proFeatureDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default QuitPlanScreen;
