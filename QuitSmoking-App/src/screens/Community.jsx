import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native';
import { io } from 'socket.io-client';
import CommunityHeader from '../components/CommunityHeader';
import TabNavigation from '../components/TabNavigation';
import MessageCard from '../components/MessageCard';
import MessageInput from '../components/MessageInput';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/config';
import CoachChat from '../components/CoachChat';
import { LOCAL_IP_ADDRESS, SOCKET_URL } from '../config/config';
// const SOCKET_URL = `http://${LOCAL_IP_ADDRESS}:3000/community`; // Đổi thành URL backend của bạn

const Community = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState('community');
  const scrollViewRef = useRef();
  const { user, token } = useAuth();
  const currentUserId = user._id;
  useEffect(() => {
    if (!token) return;

    const getMessages = async (token) => {
      try {
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE_URL}/community/messages`, {
          method: 'GET',
          headers: headers,
        });
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Fetched community messages:', data);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return data;
      } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
    };

    getMessages(token)
      .then(data => {
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch(() => setMessages([]));

    // Kết nối socket
    const newSocket = io(`${SOCKET_URL}/community`, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('chat message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => newSocket.disconnect();
  }, [token]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socket) return;
    socket.emit('chat message', { message: inputMessage });
    setInputMessage('');
  };

  const renderMessage = (msg, index) => {
    const isOwn =
      msg.author_id &&
      (msg.author_id.id === currentUserId || msg.author_id._id === currentUserId);
    const avatarText =
      msg.author_id && msg.author_id.full_name
        ? msg.author_id.full_name
            .split(' ')
            .map(w => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
        : '??';
  
    // Nếu là tin nhắn badge
    if (msg.type === 'badge' && msg.badge) {
      return (
        <View
          key={msg._id || index}
          style={[
            styles.messageRow,
            isOwn ? styles.ownMessage : styles.otherMessage,
          ]}
        >
          <View style={{
            backgroundColor: '#FFF8E1',
            borderColor: '#FFD700',
            borderWidth: 1.5,
            borderRadius: 14,
            padding: 12,
            marginVertical: 4,
            maxWidth: 300,
          }}>
            <Text style={{ fontWeight: 'bold', color: '#FF6B35', marginBottom: 4 }}>
              🏅 Thành tích mới: {msg.badge.name}
            </Text>
            <Text style={{ color: '#333', marginBottom: 4 }}>{msg.badge.description}</Text>
            <Text style={{ fontStyle: 'italic', color: '#888' }}>{msg.content}</Text>
          </View>
        </View>
      );
    }

    return (
      <View
  key={msg._id || index}
  style={[
    styles.messageRow,
    isOwn ? styles.ownMessage : styles.otherMessage,
  ]}
>
  {!isOwn && (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{avatarText}</Text>
    </View>
  )}

  <View style={{ flexShrink: 1 }}>
    <View style={[
      styles.messageBubble,
      isOwn ? styles.ownBubble : styles.otherBubble,
    ]}>
      <Text style={styles.messageText}>{msg.content}</Text>
    </View>
    <Text
      style={[
        styles.timestamp,
        { textAlign: isOwn ? "right" : "left" }
      ]}
    >
      {msg.created_at
        ? new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A"}
    </Text>
  </View>

  {isOwn && (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{avatarText}</Text>
    </View>
  )}
</View>



    );
  };
  
  
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <CommunityHeader />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'community' && styles.activeTab]}
            onPress={() => setActiveTab('community')}
          >
            <Text style={activeTab === 'community' ? styles.activeTabText : styles.tabText}>Cộng đồng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'coach' && styles.activeTab]}
            onPress={() => setActiveTab('coach')}
          >
            <Text style={activeTab === 'coach' ? styles.activeTabText : styles.tabText}>Coach</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'community' && (
          <View style={styles.chatWrapper}>
            <View style={styles.header} />
            <ScrollView
              style={styles.messages}
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map(renderMessage)}
            </ScrollView>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Nhập tin nhắn của bạn..."
                value={inputMessage}
                onChangeText={setInputMessage}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                <Text style={styles.sendBtnText}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'coach' && (
          <View style={styles.coachWrapper}>
            <CoachChat />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4ECB71',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#4ECB71',
    fontWeight: 'bold',
  },
  chatWrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 0,
  },
  messages: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    maxWidth: '80%',
  },
  ownMessage: { alignSelf: "flex-end" },
  otherMessage: { alignSelf: "flex-start" },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4ECB71',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  messageContent: {
    flexShrink: 1,
  },
  author: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
    color: '#333',
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    padding: 10,
  },
  ownBubble: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 10,
  },
  messageText: {
    fontSize: 15,
    color: '#111',
  },
  inputWrapper: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  sendBtn: {
    backgroundColor: '#4ECB71',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  coachWrapper: {
    flex: 1,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    maxWidth: '90%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
});


export default Community;
