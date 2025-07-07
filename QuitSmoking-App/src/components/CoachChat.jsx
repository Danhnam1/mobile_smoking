import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native";
import { io } from "socket.io-client";
import { getOrCreateSession, getSessionByCoach, getMessages, closeSession } from "../api/chat";
// import CoachVideoCall from "./CoachVideoCall";
import { LOCAL_IP_ADDRESS } from "../config/config";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
const CoachChat = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [showCall, setShowCall] = useState(false);
  const scrollViewRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const setupChat = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      try {
        const response = await getOrCreateSession();
        const sessionData = response?.data?.data;
        const sid = sessionData?._id;
        if (!sid) return;

        setSessionId(sid);

        const msgRes = await getMessages(sid);
        setMessages(msgRes?.data?.data || []);

        const socket = io(`http://${LOCAL_IP_ADDRESS}:3000/coach`, { auth: { token } });

        socketRef.current.on("connect", () => {
          socketRef.current.emit("joinSession", sid);
        });

        socketRef.current.on("newMessage", (msg) => {
          setMessages((prev) => [...prev, msg]);
        });
      } catch (err) {
        console.error("Lỗi setup chat:", err);
      }
    };

    setupChat();
    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || !sessionId) return;
    socketRef.current.emit("sendMessage", { sessionId, content: input });
    setInput("");
  };

  const getAvatarText = (name = "") => {
    const words = name.split(" ");
    if (words.length === 0) return "??";
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat với Coach</Text>
        <TouchableOpacity style={styles.videoBtn} onPress={() => setShowCall(true)}>
          <Icon name="video" size={20} color="#fff" />
          <Text style={styles.videoBtnText}>Gọi video</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.messages}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, idx) => {
          const senderId = msg.user_id?._id || msg.user_id || msg.author?._id;
          const senderName = msg.author?.full_name || msg.user_id?.full_name || "Coach";
          const isOwn = String(senderId) === String(userId);
          const avatar = getAvatarText(senderName);

          return (
            <View
              key={idx}
              style={[styles.message, isOwn && styles.ownMessage]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatar}</Text>
              </View>
              <View style={styles.messageContent}>
                <Text style={styles.author}>{senderName}</Text>
                <Text>{msg.content}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          placeholder="Nhắn gì đó..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>Gửi</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showCall} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCall(false)}
            >
              <Text style={styles.closeBtnText}>Đóng</Text>
            </TouchableOpacity>
            {/* <CoachVideoCall /> */}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#4f8cff" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  videoBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#2563eb", padding: 8, borderRadius: 6 },
  videoBtnText: { color: "#fff", marginLeft: 6 },
  messages: { flex: 1, padding: 16 },
  message: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  ownMessage: { alignSelf: "flex-end", backgroundColor: "#e0f7fa", borderRadius: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center", marginRight: 8 },
  avatarText: { color: "#fff", fontWeight: "bold" },
  messageContent: { maxWidth: "80%" },
  author: { fontWeight: "bold", marginBottom: 2 },
  inputRow: { flexDirection: "row", alignItems: "center", padding: 8, borderTopWidth: 1, borderColor: "#eee" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  sendBtn: { backgroundColor: "#2563eb", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  sendBtnText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", height: "80%", backgroundColor: "#fff", borderRadius: 12, padding: 16, position: "relative" },
  closeBtn: { position: "absolute", top: 10, right: 10, zIndex: 10, backgroundColor: "#ef4444", padding: 8, borderRadius: 8 },
  closeBtnText: { color: "#fff", fontWeight: "bold" },
});

export default CoachChat;
