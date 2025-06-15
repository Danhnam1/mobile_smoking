import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Text } from 'react-native';
import CommunityHeader from '../components/CommunityHeader';
import TabNavigation from '../components/TabNavigation';
import MessageCard from '../components/MessageCard';
import MessageInput from '../components/MessageInput';

const Community = () => {
  // Updated placeholder data for messages to match the new image
  const messages = [
    {
      id: '1',
      avatar: require('../../assets/icon.png'), // Using existing icon as placeholder
      username: 'LuciFaye613',
      message: 'tải về để cai chứ',
      time: '5d',
      isUser: false,
    },
    {
      id: '2',
      avatar: require('../../assets/icon.png'), // Using existing icon as placeholder
      username: 'LuciFaye613',
      message: 'cố lên bác',
      time: '5d',
      isUser: false,
    },
    {
      id: '3',
      avatar: require('../../assets/icon.png'), // Using existing icon as placeholder
      username: 'thanhcong220284',
      message: 'e nay đầu tiên',
      time: '5d',
      isUser: false,
    },
    {
      id: '4',
      avatar: 'B',
      username: 'blun00001',
      message: 'Since May 31, 2025:\n6 days smoke free,\n139 down,\n104.622 đ and 13:56 saved!',
      time: '4d',
      isUser: false,
    },
    {
      id: '5',
      avatar: 'B',
      username: 'blun00001',
      message: '6 ngày rồi, cùng cố gắng nào các bạn',
      time: '4d',
      isUser: false,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <CommunityHeader />
      <TabNavigation />
      <ScrollView style={styles.messageList} contentContainerStyle={styles.messageListContent}>
        {messages.map((message) => (
          <MessageCard key={message.id} {...message} />
        ))}
      </ScrollView>
      <MessageInput />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messageListContent: {
    paddingBottom: 20, // Add padding to the bottom of the scroll view
  },
});

export default Community;
