import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Assuming icons are from here
import ProgressByWeek from '../components/ProgressByWeek'; // Updated import path
import { useAuth } from '../contexts/AuthContext';
import { fetchQuitPlan, getQuitPlanSummary } from '../api/quitPlan';
import { fetchSmokingStatus } from '../api';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const TrackProgress = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState({
    daysQuit: 0,
    cigarettesAvoided: 0,
    moneySaved: 0,
    completionRate: 0
  });

  const { user, token } = useAuth();

  const loadData = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Get smoking status for average cigarettes per day
      const preStatus = await fetchSmokingStatus(token);
      const avgCigPerDay = preStatus?.cigarette_count || 0;

      // Get quit plan and summary
      const quitPlan = await fetchQuitPlan(user._id, token);
      if (quitPlan) {
        const summary = await getQuitPlanSummary(quitPlan._id, token);
        const daysQuit = summary.progress_days || 0;
        const totalCigarettesSmoked = summary.total_cigarettes || 0;
        let cigarettesAvoided = (daysQuit * avgCigPerDay) - totalCigarettesSmoked;
        if (cigarettesAvoided < 0) cigarettesAvoided = 0;

        setProgressData({
          daysQuit,
          cigarettesAvoided,
          moneySaved: summary.total_money_spent || 0,
          completionRate: summary.completion_rate || 0
        });
      }
    } catch (err) {
      console.error('Error loading progress data:', err);
      setError('Không thể tải dữ liệu tiến trình');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Thống kê tiến trình</Text>
      </View>

      {/* Main Progress Card */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="target" size={20} color="#4CAF50" />
          <Text style={styles.cardTitle}>Tổng quan tiến trình</Text>
        </View>
        <Text style={styles.progressCount}>{progressData.daysQuit}</Text>
        <Text style={styles.progressLabel}>Ngày không hút thuốc</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressData.completionRate}%` }]} />
        </View>
        <Text style={styles.targetText}>Mục tiêu 90 ngày: {progressData.completionRate}%</Text>
      </View>

      {/* Bottom Cards */}
      <View style={styles.bottomCardsContainer}>
        <View style={styles.bottomCard}>
          <MaterialCommunityIcons name="cash-multiple" size={24} color="#4CAF50" />
          <Text style={styles.bottomCardValue}>{Number(progressData.moneySaved).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} đ</Text>
          <Text style={styles.bottomCardLabel}>Tiền tiết kiệm</Text>
        </View>
        <View style={styles.bottomCard}>
          <MaterialCommunityIcons name="smoking-off" size={24} color="#E57373" />
          <Text style={styles.bottomCardValue}>{progressData.cigarettesAvoided}</Text>
          <Text style={styles.bottomCardLabel}>Điếu thuốc tránh được</Text>
        </View>
      </View>

      {/* Progress by Week Component */}
      <ProgressByWeek />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    width: '100%',
    backgroundColor: '#4CAF50',
    paddingVertical: 30,
    paddingTop: 45,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    width: width * 0.9,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 25,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  progressCount: {
    fontSize: 52,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 8,
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 17,
    color: '#666',
    marginBottom: 30,
    letterSpacing: 0.3,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 6,
  },
  targetText: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    letterSpacing: 0.2,
  },
  bottomCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.9,
    marginTop: 15,
  },
  bottomCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: width * 0.43,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomCardValue: {
    fontSize: 36,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    color: '#1A1A1A',
  },
  bottomCardLabel: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
});

export default TrackProgress;
