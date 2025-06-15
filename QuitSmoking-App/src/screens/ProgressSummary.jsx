import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const ProgressSummary = ({ navigation, route }) => {
  // Nhận dữ liệu từ route.params
  const { cigarettesAvoided, moneySaved } = route.params || { cigarettesAvoided: 0, moneySaved: 0 };
  const { updateUserProfile } = useAuth();

  const handleNext = async () => {
    // Cập nhật trạng thái isProfileComplete thành true
    await updateUserProfile({ isProfileComplete: true });
    // Điều hướng đến màn hình Hồ sơ
    navigation.navigate('ProfileScreen');
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }} />
      <Text style={styles.title}>Your first month{"\n"}smoke-free</Text>
      <View style={styles.row}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="fire" size={32} color="#F7B6A3" style={{ marginBottom: 6 }} />
          <Text style={styles.cardValue}>{cigarettesAvoided}</Text>
          <Text style={styles.cardLabel}>cigarettes{"\n"}avoided</Text>
        </View>
        <View style={styles.card}>
          <MaterialIcons name="attach-money" size={32} color="#FFD600" style={{ marginBottom: 6 }} />
          <Text style={styles.cardValue}>{moneySaved.toLocaleString()} đ</Text>
          <Text style={styles.cardLabel}>money{"\n"}saved</Text>
        </View>
      </View>
      <Text style={styles.plus}>+</Text>
      <Text style={styles.desc}>Your body will have improved in 4 different areas{"\n"}according to the WHO</Text>
      <View style={styles.flex1} />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
      <View style={styles.dotsRow}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 120,
    elevation: 2,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  plus: {
    fontSize: 32,
    color: '#888',
    marginVertical: 8,
    fontWeight: '400',
  },
  desc: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    backgroundColor: '#4ECB71',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8D8D8',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#222',
    width: 18,
    borderRadius: 5,
  },
  flex1: { flex: 1 },
});

export default ProgressSummary; 