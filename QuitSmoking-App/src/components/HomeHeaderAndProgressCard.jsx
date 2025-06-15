import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeHeaderAndProgressCard = ({ progressData }) => {
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
          <Text style={styles.metricValue}>{progressData.moneySaved}</Text>
          <Text style={styles.metricLabel}>dong{`\n`}saved</Text>
        </View>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overallProgressContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  overallProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  metricItem: {
    alignItems: 'center',
    width: '23%',
  },
  metricIcon: {
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeHeaderAndProgressCard; 