import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { io } from "socket.io-client";
import { getMessages } from "../api/chat";
import { useAuth } from "../contexts/AuthContext";
import { LOCAL_IP_ADDRESS } from "../config/config";
const getAvatarText = (name = "") => {
  const words = name.trim().split(" ");
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};
export default function ChatDetailScreen({ route, navigation }) {
  const { session } = route.params;
  const { token, user } = useAuth();
  const currentUserId = user?._id;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    socketRef.current = io(`http://${LOCAL_IP_ADDRESS}:3000/coach`, {
      auth: { token },
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("joinSession", session._id);
    });

    socketRef.current.on("newMessage", (msg) => {
      if (msg.session_id === session._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socketRef.current.disconnect();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await getMessages(token, session._id);
      setMessages(res?.data || []);
    } catch (err) {
      console.error("Không thể tải tin nhắn", err);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    socketRef.current.emit("sendMessage", {
      sessionId: session._id,
      content: input,
    });
    setInput("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>
                {getAvatarText(session.user_id.full_name)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.headerTitle}>
                {session.user_id?.full_name || "Không rõ"}
              </Text>
              <TouchableOpacity
                style={{
                  marginLeft: 12,
                  backgroundColor: "#2563eb",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 6,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={() => {
                  const coachId =
                    session.coach_id?._id || session.coach_id || null;
                  const memberId =
                    session.user_id?._id || session.user_id || null;
                  if (coachId && memberId) {
                    // Tạo roomName động: c<4 ký tự cuối coachId>m<4 ký tự cuối memberId>
                    const shortCoach = String(coachId)
                      .replace(/[^a-zA-Z0-9]/g, "")
                      .slice(-4);
                    const shortMember = String(memberId)
                      .replace(/[^a-zA-Z0-9]/g, "")
                      .slice(-4);
                    const roomName =
                      `c${shortCoach}m${shortMember}`.toLowerCase();
                    console.log("roomName truyền vào:", roomName);
                    navigation.navigate("VideoCallScreen", { roomName });
                  } else {
                    alert("Không tìm thấy userId hoặc coachId!");
                  }
                }}
              >
                <Icon name="video" size={18} color="#fff" />
                <Text style={{ color: "#fff", marginLeft: 6 }}>Meeting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          style={{ flex: 1 }}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((msg, idx) => {
            const isMe =
              msg.user_id === currentUserId ||
              msg.user_id?._id === currentUserId;

            const senderName =
              msg.author?.full_name || msg.user_id?.full_name || "Coach";

            const avatar = getAvatarText(senderName);

            return (
              <View
                key={idx}
                style={[
                  styles.messageRow,
                  isMe ? styles.ownMessage : styles.otherMessage,
                ]}
              >
                {/* Avatar trái */}
                {!isMe && (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{avatar}</Text>
                  </View>
                )}

                {/* Bubble + timestamp */}
                <View style={{ flexShrink: 1 }}>
                  <View
                    style={[
                      styles.messageBubble,
                      isMe ? styles.ownBubble : styles.otherBubble,
                    ]}
                  >
                    <Text style={styles.messageText}>{msg.content}</Text>
                  </View>
                  <Text
                    style={[
                      styles.timestamp,
                      { textAlign: isMe ? "right" : "left" },
                    ]}
                  >
                    {new Date(msg.sent_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                {/* Avatar phải */}
                {isMe && (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{avatar}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nhắn gì đó..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Icon name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#2563eb",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4ECB71",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerAvatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 8,
  },
  videoBtn: {
    marginLeft: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  videoBtnText: {
    color: "#2563eb",
    marginLeft: 6,
    fontWeight: "bold",
    fontSize: 15,
  },
  messages: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  messageRow: {
    flexDirection: "row", // Quan trọng nhất!
    alignItems: "flex-start", // Canh theo top cho avatar và bubble thẳng hàng
    marginVertical: 4,
    maxWidth: "90%",
  },
  ownMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4ECB71",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  messageBubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: 260,
  },
  ownBubble: {
    backgroundColor: "#dbeafe",
  },
  otherBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  messageText: {
    fontSize: 15,
    color: "#111",
  },
  timestamp: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#2563eb",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#f9fafb",
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
});
