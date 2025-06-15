import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AntDesign, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeStatsSection({ healthValue, badgeValue, communityValue }) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <AntDesign name="hearto" size={24} color="blue" />
        <Text style={styles.statLabel}>Sức khỏe</Text>
        <Text style={styles.statValue}>{healthValue}</Text>
      </View>
      <View style={styles.statBox}>
        <FontAwesome name="trophy" size={24} color="gold" />
        <Text style={styles.statLabel}>Huy hiệu</Text>
        <Text style={styles.statValue}>{badgeValue}</Text>
      </View>
      <View style={styles.statBox}>
        <MaterialCommunityIcons name="account-group-outline" size={24} color="purple" />
        <Text style={styles.statLabel}>Cộng đồng</Text>
        <Text style={styles.statValue}>{communityValue}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginBottom: 20,
    marginTop: 20,
  },
  statBox: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
}); 