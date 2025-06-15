import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MoodTag from './MoodTag';

const ProgressWeekItem = ({ week, noSmokingDays, savingsMoney, mood }) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>{week}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>No smoking day:</Text>
        <Text style={styles.value}>{noSmokingDays}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Savings money:</Text>
        <Text style={[styles.value, styles.savingsMoney]}>{savingsMoney}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Mood:</Text>
        <MoodTag mood={mood} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  savingsMoney: {
    color: '#E53935', // Red color for savings money
  },
});

export default ProgressWeekItem; 