import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'chat' && styles.activeTabButton]}
        onPress={() => setActiveTab('chat')}
      >
        <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'mentions' && styles.activeTabButton]}
        onPress={() => setActiveTab('mentions')}
      >
        <Text style={[styles.tabText, activeTab === 'mentions' && styles.activeTabText]}>Mentions</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'buddies' && styles.activeTabButton]}
        onPress={() => setActiveTab('buddies')}
      >
        <Text style={[styles.tabText, activeTab === 'buddies' && styles.activeTabText]}>Buddies</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tabButton: {
    paddingBottom: 8, // Increased padding to separate text from underline
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#888', // Inactive tab text color
  },
  activeTabButton: {
    borderBottomWidth: 3, // Thicker underline
    borderBottomColor: '#4CAF50', // Green color for active tab underline
  },
  activeTabText: {
    color: '#4CAF50', // Green color for active tab text
    fontWeight: 'bold', // Make active tab text bold
  },
});

export default TabNavigation; 