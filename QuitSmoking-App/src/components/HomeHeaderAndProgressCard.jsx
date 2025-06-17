import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getQuitPlanSummary, fetchQuitPlan } from '../api/quitPlan';
import { useAuth } from '../contexts/AuthContext';

const HomeHeaderAndProgressCard = ({ progressData }) => {
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const plan = await fetchQuitPlan(user._id, token);
        if (plan && plan._id) {
          const summary = await getQuitPlanSummary(plan._id, token);
          setProgressData({
            daysQuit: summary.progress_days || 0,
            cigarettesAvoided: summary.total_cigarettes || 0,
            moneySaved: summary.total_money_spent || 0,
          });
        }
      } catch (err) {}
    };
    if (user && token) fetchProgress();
  }, [user, token]);

  return (
    <View style={styles.overallProgressContainer}>
      <Text style={styles.overallProgressTitle}>Overall Progress</Text>
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Ionicons name="calendar-outline" size={40} color="#4285F4" style={styles.metricIcon} />
          <Text style={styles.metricValue}>{progressData.daysQuit}</Text>
          <Text style={styles.metricLabel}>days{`\n`}quit</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="flame-outline" size={40} color="#EA4335" style={styles.metricIcon} />
          <Text style={styles.metricValue}>{progressData.cigarettesAvoided}</Text>
          <Text style={styles.metricLabel}>cigarettes{`\n`}avoided</Text>
        </View>
        <View style={styles.metricItem}>
          <Ionicons name="cash-outline" size={40} color="#34A853" style={styles.metricIcon} />
          <Text style={styles.metricValue}>{Number(progressData.moneySaved).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} đ</Text>
          <Text style={styles.metricLabel}>dong{`\n`}saved</Text>
        </View>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overallProgressContainer: {
    backgroundColor: '#fff',
    marginTop: 18,
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  overallProgressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 22,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    marginTop: 2,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
});

export default HomeHeaderAndProgressCard; 