import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeHealthImprovementSection({ badges }) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Huy hiệu</Text>
      </View>
      {badges.map((badge, index) => (
        <View style={styles.badgeItem} key={index}>
          <MaterialCommunityIcons name={badge.iconName} size={24} color={badge.color} />
          <View>
            <Text style={styles.badgeItemTitle}>{badge.title}</Text>
            <Text style={styles.badgeItemDescription}>{badge.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  badgeItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeItemTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#333',
  },
  badgeItemDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 15,
    marginTop: 2,
  },
}); 