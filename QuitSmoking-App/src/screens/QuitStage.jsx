import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import {
  getQuitPlanStages,
  getQuitPlanSummary,
  recordProgress,
  getProgressByStage,
  recordSmokingStatus,
  getSmokingStatus,
} from "../api/quitPlan";
import { useAuth } from "../contexts/AuthContext";
import { fetchQuitPlan } from "../api/quitPlan";
import { useFocusEffect } from "@react-navigation/native";

const QuitStage = ({ navigation, route }) => {
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [cigarettesToday, setCigarettesToday] = useState("");
  const [stagesData, setStagesData] = useState([]);
  const [loadingStages, setLoadingStages] = useState(true);
  const [errorStages, setErrorStages] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);
  const [recordedToday, setRecordedToday] = useState({});
  const [recordingStage, setRecordingStage] = useState(null);
  const [exceededDays, setExceededDays] = useState({});
  const { user, token } = useAuth();

  // Determine the planId to use based on route params or fetching active plan
  useEffect(() => {
    const initializePlanId = async () => {
      if (route.params?.planId) {
        setCurrentPlanId(route.params.planId);
      } else if (user && token) {
        try {
          const activePlan = await fetchQuitPlan(user._id, token);
          if (activePlan && activePlan._id) {
            setCurrentPlanId(activePlan._id);
          } else {
            setErrorStages("Không tìm thấy kế hoạch cai thuốc đang hoạt động.");
            setErrorSummary(
              "Không tìm thấy kế hoạch cai thuốc đang hoạt động."
            );
            setLoadingStages(false);
            setLoadingSummary(false);
          }
        } catch (error) {
          console.error("Failed to fetch active quit plan:", error);
          setErrorStages("Lỗi khi tải kế hoạch cai thuốc đang hoạt động.");
          setErrorSummary("Lỗi khi tải kế hoạch cai thuốc đang hoạt động.");
          setLoadingStages(false);
          setLoadingSummary(false);
        }
      } else {
        setLoadingStages(false);
        setLoadingSummary(false);
      }
    };

    initializePlanId();
  }, [route.params?.planId, user, token]);

  const fetchStagesAndSummary = useCallback(async () => {
    if (!user || !token || !currentPlanId) {
      setLoadingStages(false);
      setLoadingSummary(false);
      return;
    }

    try {
      setLoadingStages(true);
      setLoadingSummary(true);

      const [stagesResponse, summaryResponse] = await Promise.all([
        getQuitPlanStages(currentPlanId, token),
        getQuitPlanSummary(currentPlanId, token),
      ]);

      if (stagesResponse && Array.isArray(stagesResponse)) {
        setStagesData(stagesResponse);
      } else {
        setErrorStages("Invalid stages data received");
      }

      if (summaryResponse) {
        setSummaryData(summaryResponse);
      } else {
        setErrorSummary("Invalid summary data received");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const statusMap = {};
      const exceededMap = {};

      await Promise.all(
        stagesResponse.map(async (stage) => {
          const stageStart = new Date(stage.start_date);
          stageStart.setHours(0, 0, 0, 0);

          const stageEnd = new Date(stage.end_date);
          stageEnd.setHours(0, 0, 0, 0);

          if (stageStart <= today) {
            try {
              const res = await getProgressByStage(
                currentPlanId,
                stage._id,
                token
              );

              // Check if recorded today
              const found = res.some((r) => {
                const recordDate = new Date(r.date);
                recordDate.setHours(0, 0, 0, 0);
                return recordDate.getTime() === today.getTime();
              });
              statusMap[stage._id] = !!found;

              // Calculate exceeded days
              if (stage.max_daily_cigarette !== null) {
                let consecutiveExceeded = 0;
                const sortedRecords = res
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 3); // Check last 3 days

                for (const record of sortedRecords) {
                  if (record.cigarette_count > stage.max_daily_cigarette) {
                    consecutiveExceeded++;
                  } else {
                    break; // Reset if one day is within limit
                  }
                }
                exceededMap[stage._id] = consecutiveExceeded;
              }
            } catch (progressError) {
              console.error(
                `Error checking progress for stage ${stage._id}:`,
                progressError
              );
              statusMap[stage._id] = false;
              exceededMap[stage._id] = 0;
            }
          } else {
            statusMap[stage._id] = false;
            exceededMap[stage._id] = 0;
          }
        })
      );

      setRecordedToday(statusMap);
      setExceededDays(exceededMap);
    } catch (error) {
      console.error("QuitStage: Error fetching stages and summary:", error);
      setErrorStages("Lỗi khi tải dữ liệu giai đoạn.");
      setErrorSummary("Lỗi khi tải dữ liệu tổng quan.");
    } finally {
      setLoadingStages(false);
      setLoadingSummary(false);
    }
  }, [currentPlanId, user, token]);

  useFocusEffect(
    useCallback(() => {
      fetchStagesAndSummary();
    }, [fetchStagesAndSummary])
  );

  const handleRecordProgress = async (stageId) => {
    if (!cigarettesToday || cigarettesToday.trim() === "") {
      Alert.alert(
        "Error",
        "Please enter the number of cigarettes smoked today."
      );
      return;
    }

    const cigaretteCount = parseInt(cigarettesToday);
    if (isNaN(cigaretteCount) || cigaretteCount < 0) {
      Alert.alert("Error", "Please enter a valid number of cigarettes.");
      return;
    }

    setRecordingStage(stageId);
    try {
      const progressData = {
        cigarette_count: cigaretteCount,
        date: new Date().toISOString().split("T")[0],
      };

      const response = await recordProgress(
        currentPlanId,
        stageId,
        progressData,
        token
      );

      // 🟡 Xử lý logic backend response
      if (response?.cancelled) {
        // Stage bị hủy do vượt quá 3 ngày
        Alert.alert(
          "Stage Cancelled",
          response.message ||
            "Stage has been cancelled due to exceeding cigarette limit for 3 consecutive days.",
          [
            {
              text: "OK",
              onPress: () => {
                // Xóa currentPlanId và navigate về status
                setCurrentPlanId(null);
                navigation.navigate("SmokingStatus");
              },
            },
          ]
        );
        return;
      } else if (response?.warning) {
        // Cảnh báo nhưng vẫn tiếp tục
        Alert.alert(
          "Warning",
          response.message || "You're approaching the daily cigarette limit.",
          [
            {
              text: "Continue",
              onPress: () => {
                setCigarettesToday("");
                setRecordedToday((prev) => ({ ...prev, [stageId]: true }));
                fetchStagesAndSummary();
              },
            },
          ]
        );
      } else {
        // Thành công bình thường
        Alert.alert("Success", "Progress recorded successfully!");
        setCigarettesToday("");
        setRecordedToday((prev) => ({ ...prev, [stageId]: true }));

        // 🔄 Refresh data để check completion
        await fetchStagesAndSummary();

        // 🎉 Check if plan completed
        if (summaryData && summaryData.completion_rate >= 100) {
          Alert.alert(
            "🎉 Congratulations!",
            "You have successfully completed your quit plan!",
            [
              {
                text: "View Summary",
                onPress: () => {
                  // Navigate to completion screen or show summary
                  navigation.navigate("ProgressSummary", {
                    planId: currentPlanId,
                  });
                },
              },
              {
                text: "Back to Home",
                onPress: () => {
                  setCurrentPlanId(null);
                  navigation.navigate("Home");
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Error recording progress:", error);
      Alert.alert("Error", error.message || "Failed to record progress");
    } finally {
      setRecordingStage(null);
    }
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  const getStageStatusColor = (stage) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(stage.start_date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(stage.end_date);
    endDate.setHours(0, 0, 0, 0);

    if (stage.status === "completed") return "#4CAF50";
    if (stage.status === "in_progress") return "#FF9800";
    if (today >= startDate && today <= endDate) return "#2196F3";
    if (today > endDate) return "#F44336";
    return "#9E9E9E";
  };

  const getStageStatusText = (stage) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(stage.start_date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(stage.end_date);
    endDate.setHours(0, 0, 0, 0);

    if (stage.status === "completed") return "Hoàn thành";
    if (stage.status === "in_progress") return "Đang thực hiện";
    if (today >= startDate && today <= endDate) return "Hôm nay";
    if (today > endDate) return "Quá hạn";
    return "Chưa bắt đầu";
  };

  if (loadingStages || loadingSummary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorStages || errorSummary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorText}>
            {(errorStages && String(errorStages)) ||
              (errorSummary && String(errorSummary)) ||
              "An error occurred"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchStagesAndSummary}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quit Plan Progress</Text>
        <TouchableOpacity
          onPress={fetchStagesAndSummary}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh" size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Summary Section */}
        {summaryData && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Plan Summary</Text>

            {/* 🎉 Completion Banner */}
            {summaryData.completion_rate >= 100 && (
              <View style={styles.completionBanner}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
                <Text style={styles.completionText}>
                  🎉 Congratulations! Plan Completed! 🎉
                </Text>
              </View>
            )}

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Goal</Text>
                <Text style={styles.summaryValue}>{summaryData.goal}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Progress Days</Text>
                <Text style={styles.summaryValue}>
                  {summaryData.progress_days}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Cigarettes</Text>
                <Text style={styles.summaryValue}>
                  {summaryData.total_cigarettes}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Completion Rate</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    summaryData.completion_rate >= 100 && styles.completedValue,
                  ]}
                >
                  {summaryData.completion_rate}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Stages Section */}
        <View style={styles.stagesContainer}>
          <Text style={styles.stagesTitle}>Plan Stages</Text>
          {stagesData.map((stage) => (
            <View key={stage._id} style={styles.stageCard}>
              <View style={styles.stageHeader}>
                <View style={styles.stageInfo}>
                  <Text style={styles.stageName}>{stage.name}</Text>
                  <Text style={styles.stageDate}>
                    {formatDateDisplay(stage.start_date)} -{" "}
                    {formatDateDisplay(stage.end_date)}
                  </Text>
                  {stage.max_daily_cigarette && (
                    <Text style={styles.maxCigarettes}>
                      Max: {stage.max_daily_cigarette} cigarettes/day
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStageStatusColor(stage) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStageStatusText(stage)}
                  </Text>
                </View>
              </View>

              <Text style={styles.stageDescription}>{stage.description}</Text>

              {stage.status === "in_progress" &&
                !recordedToday[stage._id] &&
                summaryData?.completion_rate < 100 && (
                  <View style={styles.recordSection}>
                    <Text style={styles.recordLabel}>
                      Record today's progress:
                    </Text>
                    {stage.max_daily_cigarette && (
                      <Text style={styles.maxCigarettesInfo}>
                        Target: Max {stage.max_daily_cigarette} cigarettes per
                        day
                      </Text>
                    )}

                    {/* ⚠️ Warning about 3-day rule */}
                    <View style={styles.warningContainer}>
                      <Ionicons name="warning" size={16} color="#FF6B35" />
                      <Text style={styles.warningText}>
                        ⚠️ Exceeding the limit for 3 consecutive days will
                        cancel this stage
                      </Text>
                    </View>

                    {/* Show exceeded days count */}
                    {exceededDays[stage._id] > 0 && (
                      <View
                        style={[
                          styles.exceededContainer,
                          exceededDays[stage._id] >= 2 && styles.exceededDanger,
                        ]}
                      >
                        <Ionicons
                          name={
                            exceededDays[stage._id] >= 2
                              ? "alert-circle"
                              : "information-circle"
                          }
                          size={16}
                          color={
                            exceededDays[stage._id] >= 2 ? "#D32F2F" : "#FF6B35"
                          }
                        />
                        <Text
                          style={[
                            styles.exceededText,
                            exceededDays[stage._id] >= 2 &&
                              styles.exceededTextDanger,
                          ]}
                        >
                          {exceededDays[stage._id] === 1
                            ? "⚠️ 1 day exceeded limit"
                            : exceededDays[stage._id] === 2
                            ? "🚨 2 days exceeded limit - 1 more day will cancel stage!"
                            : "💥 3 days exceeded limit - Stage will be cancelled!"}
                        </Text>
                      </View>
                    )}

                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Number of cigarettes"
                        value={cigarettesToday}
                        onChangeText={setCigarettesToday}
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={[
                          styles.recordButton,
                          recordingStage === stage._id &&
                            styles.recordButtonDisabled,
                        ]}
                        onPress={() => handleRecordProgress(stage._id)}
                        disabled={recordingStage === stage._id}
                      >
                        {recordingStage === stage._id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.recordButtonText}>Record</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

              {recordedToday[stage._id] && (
                <View style={styles.recordedIndicator}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.recordedText}>
                    Progress recorded today
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    letterSpacing: 0.3,
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    padding: 18,
  },
  summaryContainer: {
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2196F3",
    marginBottom: 20,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  summaryItem: {
    width: "45%", // Adjust as needed for 2 columns
    marginVertical: 12,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  stagesContainer: {
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stagesTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2196F3",
    marginBottom: 20,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  stageCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    padding: 0, // Reset padding to control it manually
  },
  stageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  stageDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  maxCigarettes: {
    fontSize: 13,
    color: "#FF6B35",
    marginTop: 4,
    fontWeight: "600",
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  stageDescription: {
    fontSize: 15,
    color: "#666",
    paddingHorizontal: 20,
    paddingVertical: 15,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  recordSection: {
    marginTop: 0,
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  recordLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },
  maxCigarettesInfo: {
    fontSize: 14,
    color: "#FF6B35",
    marginBottom: 12,
    fontWeight: "500",
    fontStyle: "italic",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  recordButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  recordButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  recordedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  recordedText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
  },
  warningText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#E65100",
    fontWeight: "500",
    flex: 1,
  },
  exceededContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
  },
  exceededDanger: {
    backgroundColor: "#FFEBEE",
    borderLeftColor: "#D32F2F",
  },
  exceededText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#E65100",
    fontWeight: "600",
    flex: 1,
  },
  exceededTextDanger: {
    color: "#D32F2F",
  },
  completionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  completionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
    textAlign: "center",
  },
  completedValue: {
    color: "#4CAF50",
    fontWeight: "800",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default QuitStage;
