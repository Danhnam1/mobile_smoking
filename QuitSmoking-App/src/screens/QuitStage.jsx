import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { getQuitPlanStages, getQuitPlanSummary } from '../api/quitPlan';
import { recordProgress, getProgressByStage } from '../api/progressTracking';
import { useAuth } from '../contexts/AuthContext';
import { fetchQuitPlan } from '../api/quitPlan'; // Import fetchQuitPlan
import { useFocusEffect } from '@react-navigation/native';

const QuitStage = ({ navigation, route }) => {
  const [currentPlanId, setCurrentPlanId] = useState(null); // New state to hold the planId
  const [cigarettesToday, setCigarettesToday] = useState('');
  const [stagesData, setStagesData] = useState([]);
  const [loadingStages, setLoadingStages] = useState(true);
  const [errorStages, setErrorStages] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);
  const [recordedToday, setRecordedToday] = useState({}); // New state for recording status
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
            setErrorStages('Không tìm thấy kế hoạch cai thuốc đang hoạt động.');
            setErrorSummary('Không tìm thấy kế hoạch cai thuốc đang hoạt động.');
            setLoadingStages(false);
            setLoadingSummary(false);
          }
        } catch (error) {
          console.error('Failed to fetch active quit plan:', error);
          setErrorStages('Lỗi khi tải kế hoạch cai thuốc đang hoạt động.');
          setErrorSummary('Lỗi khi tải kế hoạch cai thuốc đang hoạt động.');
          setLoadingStages(false);
          setLoadingSummary(false);
        }
      } else {
        setLoadingStages(false);
        setLoadingSummary(false);
      }
    };

    initializePlanId();
  }, [route.params?.planId, user, token]); // Dependencies for this effect

  const fetchStagesAndSummary = useCallback(async () => {
    if (!user || !token || !currentPlanId) { // Use currentPlanId here
      console.log('QuitStage: Exiting fetchStagesAndSummary early - Missing user, token, or currentPlanId.', { user: !!user, token: !!token, currentPlanId: !!currentPlanId });
      setLoadingStages(false);
      setLoadingSummary(false);
      return;
    }

    try {
      setLoadingStages(true);
      setLoadingSummary(true);

      const [stagesResponse, summaryResponse] = await Promise.all([
        getQuitPlanStages(currentPlanId, token), // Use currentPlanId
        getQuitPlanSummary(currentPlanId, token), // Use currentPlanId
      ]);

      console.log('QuitStage: Stages API response:', stagesResponse);
      console.log('QuitStage: Summary API response:', summaryResponse);

      if (stagesResponse && Array.isArray(stagesResponse)) {
        const stageList = stagesResponse;
        setStagesData(stageList);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const statusMap = {};

        await Promise.all(
          stageList.map(async (stage) => {
            const stageStart = new Date(stage.start_date);
            stageStart.setHours(0, 0, 0, 0);

            const stageEnd = new Date(stage.end_date);
            stageEnd.setHours(0, 0, 0, 0);

            if (stageStart <= today) {
              try {
                const res = await getProgressByStage(currentPlanId, stage._id, token);
                const found = res.some((r) => {
                  const recordDate = new Date(r.date);
                  recordDate.setHours(0, 0, 0, 0);
                  return recordDate.getTime() === today.getTime();
                });
                statusMap[stage._id] = !!found;
              } catch (progressError) {
                console.error(`Error checking progress for stage ${stage._id}:`, progressError);
                statusMap[stage._id] = false;
              }
            } else {
              statusMap[stage._id] = false;
            }
          })
        );
        setRecordedToday(statusMap);
      } else {
        setStagesData([]);
        console.warn('QuitStage: stagesResponse is not an array or is null/undefined.', stagesResponse);
      }

      if (summaryResponse) {
        console.log('QuitStage: Setting summaryData:', summaryResponse);
        setSummaryData(summaryResponse);
      } else {
        setSummaryData(null);
      }

    } catch (error) {
      console.error('Failed to load data in QuitStage:', error);
      setErrorStages('Không thể tải các giai đoạn kế hoạch.');
      setErrorSummary('Không thể tải dữ liệu tổng quan.');
    } finally {
      setLoadingStages(false);
      setLoadingSummary(false);
    }
  }, [currentPlanId, user, token]);

  useEffect(() => {
    fetchStagesAndSummary();
  }, [fetchStagesAndSummary]);

  const handleRecordProgress = async (stageId) => {
    try {
      if (!cigarettesToday || isNaN(cigarettesToday) || parseInt(cigarettesToday) < 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập số điếu thuốc hợp lệ');
        return;
      }

      const cigarettesCount = parseInt(cigarettesToday);
      await recordProgress(currentPlanId, stageId, {
        cigarette_count: cigarettesCount,
        money_spent: 0 // hoặc giá trị thực tế nếu có
      }, token);
      
      // Update local state to show recorded status
      setRecordedToday(prev => ({
        ...prev,
        [stageId]: true
      }));
      
      // Clear input
      setCigarettesToday('');
      
      // Refresh summary data
      const summaryResponse = await getQuitPlanSummary(currentPlanId, token);
      if (summaryResponse) {
        setSummaryData(summaryResponse);
      }

      // Show success message
      Alert.alert('Thành công', 'Đã ghi nhận tiến trình của bạn');
    } catch (error) {
      
      Alert.alert('Bạn đã ghi rồi', 'Không thể ghi nhận tiến trình. Vui lòng thử lại.');
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  useFocusEffect(
    useCallback(() => {
      fetchStagesAndSummary();
    }, [fetchStagesAndSummary])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giai đoạn kế hoạch cai thuốc</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView style={styles.scrollViewContent}>
        {/* Overall Progress Section */}
        <View style={styles.overallProgressSection}>
          <Text style={styles.overallProgressTitle}>
            <FontAwesome name="line-chart" size={20} color="#2C3E50" /> Theo dõi tiến trình cai thuốc
          </Text>
          <Text style={styles.overallProgressSubtitle}>Cập nhật hàng ngày và theo dõi sự tiến bộ của bạn</Text>

          {loadingSummary ? (
            <ActivityIndicator size="large" color="#4CAF50" style={styles.summaryLoading} />
          ) : errorSummary ? (
            <Text style={styles.errorText}>{errorSummary}</Text>
          ) : summaryData ? (
            <View style={styles.summaryCardsGrid}>
              <View style={[styles.summaryCard, styles.summaryCardLarge, styles.summaryCard1]}>
                <Ionicons name="checkmark-circle-outline" size={28} color="#4CAF50" style={styles.summaryCheckIcon} />
                <Text style={styles.summaryValue}>{summaryData.progress_days || 0} ngày</Text>
                <Text style={styles.summaryLabel}>Số ngày ghi nhận</Text>
              </View>
              <View style={styles.summaryCardsRow}>
                <View style={[styles.summaryCard, styles.summaryCardSmall, styles.summaryCard2]}>
                  <Ionicons name="cash-outline" size={26} color="#2196F3" style={styles.summaryCheckIcon} />
                  <Text style={styles.summaryValue}>{Number(summaryData.total_money_spent || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</Text>
                  <Text style={styles.summaryLabel}>Tiền đã tiết kiệm</Text>
                </View>
                <View style={[styles.summaryCard, styles.summaryCardSmall, styles.summaryCard3]}>
                  <Ionicons name="star-outline" size={26} color="#FFC107" style={styles.summaryCheckIcon} />
                  <Text style={styles.summaryValue}>{summaryData.completion_rate || 0}%</Text>
                  <Text style={styles.summaryLabel}>Mức hoàn thành</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.noSummaryText}>Không có dữ liệu tổng quan tiến trình.</Text>
          )}
        </View>

        {/* Stage and Daily Recording Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Ionicons name="calendar-outline" size={16} color="#666" /> Giai đoạn và ghi nhận hàng ngày
          </Text>
          <Text style={styles.infoText}>
            <Ionicons name="document-text-outline" size={16} color="#666" /> Giai đoạn kế hoạch cai thuốc
          </Text>
        </View>

        {loadingStages ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : errorStages ? (
          <Text style={styles.errorText}>{errorStages}</Text>
        ) : stagesData.length > 0 ? (
          stagesData.map((stage, index) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const stageStart = new Date(stage.start_date);
            stageStart.setHours(0, 0, 0, 0);

            const stageEnd = new Date(stage.end_date);
            stageEnd.setHours(0, 0, 0, 0);

            const isFutureStage = stageStart > today;
            const isPastStage = stageEnd < today;
            const isCurrentStage = !isFutureStage && !isPastStage;

            const stageStatusLabel = isFutureStage
              ? '⏳ Chưa đến'
              : isPastStage
              ? '✅ Đã kết thúc'
              : '🔵 Đang diễn ra';

            const disabled = recordedToday[stage._id] || !isCurrentStage;

            return (
              <View
                key={stage._id}
                style={[
                  styles.stageCard,
                  isCurrentStage ? styles.ongoingStageCard : isPastStage ? styles.pastStageCard : styles.upcomingStageCard,
                ]}
              >
                <View style={styles.stageHeader}>
                  <MaterialCommunityIcons
                    name={stage.icon || 'flower-outline'}
                    size={24}
                    color={isCurrentStage ? '#2196F3' : isPastStage ? '#666' : '#FFC107'}
                    style={styles.stageIcon}
                  />
                  <Text style={styles.stageTitle}>{stage.name}</Text>
                  <View style={[styles.statusBadge,
                  isCurrentStage ? styles.ongoingBadge :
                  isPastStage ? styles.pastBadge : styles.upcomingBadge
                  ]}>
                    <Text style={styles.statusBadgeText}>
                      {stageStatusLabel}
                    </Text>
                  </View>
                </View>
                <View style={styles.stageContent}>
                  <Text style={styles.stageDescriptionHeader}>Mục tiêu tuần này:</Text>
                  {/* Split description by newline and render */}
                  {typeof stage.description === 'string' && stage.description.trim() !== '' ? (
                    stage.description.split('\n').map((item, idx) => (
                      <Text key={idx} style={styles.stageDescriptionItem}>{item.trim().startsWith('-') ? item.trim() : `- ${item.trim()}`}</Text>
                    ))
                  ) : (
                    stage.description && Array.isArray(stage.description) && stage.description.map((item, idx) => (
                      <Text key={idx} style={styles.stageDescriptionItem}>- {item}</Text>
                    ))
                  )}
                  <View style={styles.stageDateContainer}>
                    <Ionicons name="calendar-outline" size={16} color="#666" style={styles.dateIcon} />
                    <Text style={styles.stageDate}>{formatDateDisplay(stage.start_date)} → {formatDateDisplay(stage.end_date)}</Text>
                  </View>

                  {isCurrentStage && (
                    <View key={`progress-${stage._id}-${recordedToday[stage._id]}`} style={styles.progressInputContainer}>
                      <TextInput
                        style={styles.progressInput}
                        placeholder="Số điếu thuốc đã hút hôm nay (ví dụ: 5)"
                        keyboardType="numeric"
                        value={cigarettesToday}
                        onChangeText={setCigarettesToday}
                        editable={!disabled}
                      />
                      <TouchableOpacity
                        style={[styles.recordButton, disabled && styles.recordButtonDisabled]}
                        onPress={() => handleRecordProgress(stage._id)}
                        disabled={disabled}
                      >
                        <Text style={styles.recordButtonText}>
                          {recordedToday[stage._id] ? 'Đã ghi hôm nay' : 'Ghi tiến trình'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        ) : ( !loadingStages &&
          <Text style={styles.noStagesText}>Không có giai đoạn nào được tìm thấy cho kế hoạch này.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
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
    fontWeight: '700',
    color: '#222',
    letterSpacing: 0.3,
  },
  headerRight: {
    width: 28,
  },
  scrollViewContent: {
    padding: 18,
  },
  overallProgressSection: {
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  overallProgressTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 8,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  overallProgressSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  summaryCardsGrid: {
    width: '100%',
    alignItems: 'center',
  },
  summaryCardLarge: {
    width: '100%',
    marginBottom: 14,
    minHeight: 90,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  summaryCardsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  summaryCardSmall: {
    flex: 1,
    minHeight: 90,
    marginHorizontal: 4,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCard1: {
    backgroundColor: '#E8F5E9',
  },
  summaryCard2: {
    backgroundColor: '#E3F2FD',
  },
  summaryCard3: {
    backgroundColor: '#FFFDE7',
  },
  summaryCheckIcon: {
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  infoContainer: {
    marginBottom: 25,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
  textAlign:'center',
      fontSize: 16,
    color: '#666',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight:'500',
    lineHeight: 22,
  },
  stageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  ongoingStageCard: {
    borderColor: '#2196F3',
    borderWidth: 2,
    backgroundColor: '#E3F2FD',
  },
  upcomingStageCard: {
    borderColor: '#FFC107',
    borderWidth: 2,
    backgroundColor: '#FFFDE7',
  },
  pastStageCard: {
    borderColor: '#E0E0E0',
    borderWidth: 2,
    backgroundColor: '#F5F5F5',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  stageIcon: {
    marginRight: 12,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    color: '#222',
    letterSpacing: 0.2,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  ongoingBadge: {
    backgroundColor: '#2196F3',
  },
  upcomingBadge: {
    backgroundColor: '#FFC107',
  },
  pastBadge: {
    backgroundColor: '#BDBDBD',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  stageContent: {
    padding: 20,
  },
  stageDescriptionHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
    letterSpacing: 0.2,
  },
  stageDescriptionItem: {
    fontSize: 15,
    marginBottom: 6,
    color: '#666',
    lineHeight: 22,
  },
  stageDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  dateIcon: {
    marginRight: 8,
  },
  stageDate: {
    fontSize: 15,
    color: '#666',
    letterSpacing: 0.2,
  },
  progressInputContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    alignItems: 'center',
  },
  progressInput: {
    flex: 1,
    height: 48,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  recordButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  recordButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  noStagesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 22,
  },
  summaryLoading: {
    marginTop: 20,
  },
  noSummaryText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 22,
  },
});

export default QuitStage;
