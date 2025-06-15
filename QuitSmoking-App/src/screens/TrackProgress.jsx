import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Assuming icons are from here
import ProgressByWeek from '../components/ProgressByWeek'; // Updated import path

const { width } = Dimensions.get('window');

const TrackProgress = () => {
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
        <Text style={styles.progressCount}>0</Text>
        <Text style={styles.progressLabel}>Ngày không hút thuốc</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '0%' }]} />
        </View>
        <Text style={styles.targetText}>Mục tiêu 90 ngày: 0%</Text>
      </View>

      {/* Bottom Cards */}
      <View style={styles.bottomCardsContainer}>
        <View style={styles.bottomCard}>
          <MaterialCommunityIcons name="cash-multiple" size={24} color="#4CAF50" />
          <Text style={styles.bottomCardValue}>0đ</Text>
          <Text style={styles.bottomCardLabel}>Tiền tiết kiệm</Text>
        </View>
        <View style={styles.bottomCard}>
          <MaterialCommunityIcons name="smoking-off" size={24} color="#E57373" />
          <Text style={styles.bottomCardValue}>0</Text>
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
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  header: {
    width: '100%',
    backgroundColor: '#4CAF50', // Green header from image
    paddingVertical: 25, // Increased vertical padding for more height
    paddingTop: 40, // Account for status bar and push content down
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mainCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: width * 0.9,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
    color: '#333',
  },
  progressCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  targetText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  bottomCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.9,
    marginTop: 10,
  },
  bottomCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    width: width * 0.43,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  bottomCardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  bottomCardLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default TrackProgress;
