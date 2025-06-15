import React from 'react';
import { Text, StyleSheet } from 'react-native';

const MoodTag = ({ mood }) => {
  const getMoodStyle = () => {
    switch (mood.toLowerCase()) {
      case 'hard':
        return styles.moodHard;
      case 'better':
        return styles.moodBetter;
      case 'positive':
        return styles.moodPositive;
      default:
        return styles.moodDefault;
    }
  };

  return (
    <Text style={[styles.moodTag, getMoodStyle()]}>{mood}</Text>
  );
};

const styles = StyleSheet.create({
  moodTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  moodHard: {
    backgroundColor: '#FFA500', // Orange
  },
  moodBetter: {
    backgroundColor: '#4CAF50', // Green
  },
  moodPositive: {
    backgroundColor: '#E57373', // Reddish
  },
  moodDefault: {
    backgroundColor: '#999999',
  },
});

export default MoodTag; 