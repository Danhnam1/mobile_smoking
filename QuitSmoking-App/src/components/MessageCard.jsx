import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MessageCard = ({ avatar, username, message, time, isUser }) => {
  const isAvatarImage = typeof avatar === 'number';

  return (
    <View style={[styles.messageRow, isUser ? styles.userMessageRow : styles.otherMessageRow]}>
      {!isUser && (
        isAvatarImage ? (
          <Image source={avatar} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderText}>{avatar}</Text>
          </View>
        )
      )}
      <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.otherMessageBubble]}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.messageText}>{message}</Text>
        <View style={styles.messageFooter}>
          <Text style={styles.timeText}>{time}</Text>
          <TouchableOpacity style={styles.replyButton}>
            <Ionicons name="chatbubble-outline" size={16} color="#4CAF50" />
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  avatarPlaceholder: {
    backgroundColor: '#CC0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  messageBubble: {
    borderRadius: 10,
    padding: 10,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessageBubble: {
    backgroundColor: '#DCF8C6',
  },
  otherMessageBubble: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyButtonText: {
    marginLeft: 5,
    color: '#4CAF50',
    fontSize: 12,
  },
});

export default MessageCard; 