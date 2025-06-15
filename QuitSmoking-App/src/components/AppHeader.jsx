import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AppHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>QUITNOW</Text>
      <View style={styles.iconContainer}>
        <Ionicons name="cloud-upload-outline" size={24} color="#888" style={styles.icon} />
        <Ionicons name="settings-outline" size={24} color="#888" style={styles.icon} />
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
          <Ionicons name="person-circle-outline" size={24} color="#888" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginTop:'20',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,

    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 15,
  },
});

export default AppHeader; 