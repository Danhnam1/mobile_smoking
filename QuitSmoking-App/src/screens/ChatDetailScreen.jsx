import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView, Platform
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
export default function ChatDetailScreen({ route }) {
  const { session } = route.params;
  const { token, user } = useAuth();
  const currentUserId = user?._id;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    socketRef.current = io(`http://${LOCAL_IP_ADDRESS}:3000/coach`, { auth: { token } });

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
    <Text style={styles.headerTitle}>{session.user_id.full_name}</Text>
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
    msg.user_id === currentUserId || msg.user_id?._id === currentUserId;

  const senderName =
    msg.author?.full_name ||
    msg.user_id?.full_name ||
    "Coach";

  const avatar = getAvatarText(senderName);

  return (
    <View
  key={idx}
  style={[
    styles.messageRow,
    isMe ? styles.ownMessage : styles.otherMessage,
  ]}
>
  {!isMe && (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{avatar}</Text>
    </View>
  )}

  <View style={{ alignItems: isMe ? "flex-end" : "flex-start" }}>
    <View
      style={[
        styles.messageBubble,
        isMe ? styles.ownBubble : styles.otherBubble,
      ]}
    >
      <Text style={styles.messageText}>{msg.content}</Text>
    </View>
    <View
      style={{
        marginTop: 2,
        marginHorizontal: 4,
      }}
    >
      <Text style={styles.timestamp}>
        {new Date(msg.sent_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  </View>

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
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
      },
      headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#4ECB71",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
      },
      headerAvatarText: {
        color: "#fff",
        fontWeight: "bold",
      },
  header: {
    padding: 16,
    backgroundColor: "#4f8cff",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  messages: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  message: {
    marginVertical: 4,
    maxWidth: "75%",
  },
  ownMessage: { alignSelf: "flex-end" },
  otherMessage: { alignSelf: "flex-start" },
  ownBubble: {
    backgroundColor: "#dbeafe",
    borderRadius: 16,
    padding: 10,
  },
  otherBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 10,
  },
  messageText: { fontSize: 15, color: "#111" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  sendBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4ECB71",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
    maxWidth: "90%",
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
    textAlign: "right",
  },
});
