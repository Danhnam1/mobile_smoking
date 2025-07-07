import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { io } from 'socket.io-client';
import CommunityHeader from '../components/CommunityHeader';
import TabNavigation from '../components/TabNavigation';
import MessageCard from '../components/MessageCard';
import MessageInput from '../components/MessageInput';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/config';
import CoachChat from '../components/CoachChat';
import { LOCAL_IP_ADDRESS } from '../config/config';
const SOCKET_URL = `http://${LOCAL_IP_ADDRESS}:3000/community`; // Đổi thành URL backend của bạn
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
    const newSocket = io(SOCKET_URL, { auth: { token } });
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
    const isOwn = msg.author_id && (msg.author_id.id === currentUserId || msg.author_id._id === currentUserId);
    const avatarText = msg.author_id && msg.author_id.full_name
      ? msg.author_id.full_name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
      : '??';
    return (
      <View
        key={msg.id || msg._id || index}
        style={[styles.message, isOwn && styles.ownMessage]}
      >
        {msg.author_id ? (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarText}</Text>
          </View>
        ) : (
          <View style={[styles.avatar, { backgroundColor: '#ccc' }]}>
            <Text style={styles.avatarText}>?</Text>
          </View>
        )}
        <View style={styles.messageContent}>
          {msg.author_id && <Text style={styles.author}>{msg.author_id.full_name}</Text>}
          <Text>{msg.content}</Text>
        </View>
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
  tabs: { flexDirection: 'row', backgroundColor: '#f0f0f0' },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#4ECB71' },
  tabText: { color: '#888', fontWeight: 'bold' },
  activeTabText: { color: '#4ECB71', fontWeight: 'bold' },
  chatWrapper: { flex: 1, backgroundColor: '#fff' },
  header: { height: 0 }, // giữ chỗ cho header cũ nếu cần
  messages: { flex: 1, padding: 12 },
  message: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  ownMessage: { alignSelf: 'flex-end', backgroundColor: '#e6ffe6', borderRadius: 8, padding: 4 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4ECB71', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  messageContent: { flex: 1 },
  author: { fontWeight: 'bold', marginBottom: 2 },
  inputWrapper: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee', padding: 8, backgroundColor: '#fafafa' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 8, marginRight: 8, backgroundColor: '#fff' },
  sendBtn: { backgroundColor: '#4ECB71', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontWeight: 'bold' },
  coachWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default Community;
