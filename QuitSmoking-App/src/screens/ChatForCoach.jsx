import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { io } from "socket.io-client";
import { closeSession, getMessages, getOrCreateSession, getSessionByCoach } from "../api/chat";
import { useAuth } from "../contexts/AuthContext";
import {LOCAL_IP_ADDRESS} from "../config/config"
import { useNavigation, useRoute } from '@react-navigation/native';
export default function ChatForCoach() {
  const { token, user } = useAuth();
  const currentUserId = user?._id;
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const coachIdFromParams = route.params?.coachId;

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(`http://${LOCAL_IP_ADDRESS}:3000/coach`, { auth: { token } });

    socketRef.current.on("connect", () => {
      console.log("[Coach] Socket connected");
    });

    socketRef.current.on("newMessage", (msg) => {
      if (selectedChat && msg.session_id === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socketRef.current.disconnect();
  }, [selectedChat]);

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const fetchChatSessions = async () => {
    try {
      const res = await getSessionByCoach(token);
      console.log("res.data:", res?.data); // Đã là mảng
      setChatList(res?.data || []);
      if (res?.data?.length > 0) {
        if (coachIdFromParams) {
          // Tìm session với coachId đúng
          const found = res.data.find(item =>
            item.coach_id?._id === coachIdFromParams ||
            item.coach_id === coachIdFromParams
          );
          if (found) {
            selectChat(found);
            return;
          }
        }
        selectChat(res.data[0]);
      }
    } catch (err) {
      console.error("Không thể tải danh sách phiên chat", err);
    }
  };

  const selectChat = async (session) => {
    setSelectedChat(session);
    try {
      const res = await getMessages(token ,session._id);
      setMessages(res?.data?.data || []);
      socketRef.current.emit("joinSession", session._id);
    } catch (err) {
      console.error("Không thể tải tin nhắn");
    }
  };

  const handleSend = () => {
    if (!input.trim() || !selectedChat) return;
    socketRef.current.emit("sendMessage", {
      sessionId: selectedChat._id,
      content: input,
    });
    setInput("");
  };

  return (
    <View style={styles.container}>
      {/* Sidebar Chat List */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Trò chuyện</Text>
        <FlatList
          data={chatList}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            console.log('Sidebar user_id:', item.user_id);
            return (
              <TouchableOpacity
                style={[
                  styles.chatItem,
                  selectedChat?._id === item._id && styles.chatItemActive,
                ]}
                onPress={() => selectChat(item)}
              >
                <Image
                  source={{
                    uri: `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.user_id?.full_name || 'unknown'}`,
                  }}
                  style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.chatName}>{item.user_id?.full_name || 'Không rõ'}</Text>
                  <Text style={styles.chatEmail}>{item.user_id?.email || ''}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Chat Area */}
      <View style={styles.chatArea}>
        {selectedChat && (
          console.log('Header selectedChat.user_id:', selectedChat.user_id),
          <View style={styles.chatCard}>
            {/* Header */}
            <View style={styles.chatHeader}>
              <View style={styles.headerLeft}>
                <Image
                  source={{
                    uri: `https://api.dicebear.com/7.x/miniavs/svg?seed=${selectedChat.coach_id?.full_name || selectedChat.user_id?.full_name || 'unknown'}`,
                  }}
                  style={styles.avatarLarge}
                />
                <View>
                  <Text style={styles.chatUserName}>
                    {/* Ưu tiên tên coach nếu có */}
                    {selectedChat.coach_id?.full_name || selectedChat.user_id?.full_name || 'Không rõ'}
                  </Text>
                  <Text style={styles.chatStatus}>Coach</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.videoButton}
                onPress={() => {
                  const memberId = selectedChat.user_id?._id || selectedChat.user_id || null;
                  if (memberId) {
                    navigation.navigate('VideoCallScreen', { memberId });
                  } else {
                    alert('Không tìm thấy userId của thành viên!');
                  }
                }}
              >
                <Icon name="video" size={18} color="#fff" />
                <Text style={styles.videoButtonText}>Gọi video</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView style={styles.messages}>
              {messages.map((msg) => {
                const isMe =
                  msg.user_id === user._id ||
                  msg.user_id?._id === user._id;
                return (
                  <View
                    key={msg._id}
                    style={[
                      styles.messageRow,
                      isMe ? styles.messageRight : styles.messageLeft,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isMe ? styles.bubbleMe : styles.bubbleOther,
                      ]}
                    >
                      <Text style={styles.messageText}>{msg.content}</Text>
                    </View>
                    <Text style={styles.messageTime}>
                      {new Date(msg.sent_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Nhập tin nhắn..."
                value={input}
                onChangeText={setInput}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Icon name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 200,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderColor: "#ddd",
    padding: 8,
  },
  sidebarTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
  },
  chatItemActive: { backgroundColor: "#dbeafe" },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  chatName: { fontWeight: "bold" },
  chatEmail: { fontSize: 12, color: "#555" },
  chatArea: { flex: 1, backgroundColor: "#f9f9f9" },
  chatCard: { flex: 1, padding: 12 },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatarLarge: { width: 48, height: 48, borderRadius: 24, marginRight: 8 },
  chatUserName: { fontSize: 16, fontWeight: "bold" },
  chatStatus: { fontSize: 12, color: "#10b981" },
  videoButton: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  videoButtonText: { color: "#fff", marginLeft: 4 },
  messages: { flex: 1 },
  messageRow: {
    marginVertical: 4,
    maxWidth: "75%",
  },
  messageLeft: { alignSelf: "flex-start" },
  messageRight: { alignSelf: "flex-end" },
  messageBubble: { padding: 8, borderRadius: 8 },
  bubbleMe: { backgroundColor: "#3b82f6" },
  bubbleOther: { backgroundColor: "#e5e7eb" },
  messageText: { color: "#fff" },
  messageTime: { fontSize: 10, color: "#666", marginTop: 2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 20,
  },
});
