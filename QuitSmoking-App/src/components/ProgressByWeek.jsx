import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import ProgressWeekItem from './ProgressWeekItem';

const { width } = Dimensions.get('window');

const ProgressByWeek = () => {
  const weeklyProgressData = [
    {
      week: 'Week 1',
      noSmokingDays: '7 days',
      savingsMoney: '87,500 VNĐ',
      mood: 'hard',
    },
    {
      week: 'Week 2',
      noSmokingDays: '7 days',
      savingsMoney: '175,000 VNĐ',
      mood: 'better',
    },
    {
      week: 'Week 3',
      noSmokingDays: '1 day',
      savingsMoney: '262,500 VNĐ',
      mood: 'positive',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Progress by week</Text>
        {weeklyProgressData.map((item, index) => (
          <ProgressWeekItem key={index} {...item} />
        ))}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>Start date: 20-6-2025</Text>
          <Text style={styles.dateText}>End date: 27-6-2025</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  dateContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 15,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default ProgressByWeek; 