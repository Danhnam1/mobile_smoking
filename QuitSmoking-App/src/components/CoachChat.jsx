import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
} from "react-native";
import { io } from "socket.io-client";
import { getOrCreateSession, getMessages } from "../api/chat";
// import CoachVideoCall from "./CoachVideoCall";
import { LOCAL_IP_ADDRESS, SOCKET_URL, API_BASE_URL } from "../config/config";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

const CoachChat = () => {
  const { user, token } = useAuth();
  const currentUserId = user?._id;
  const [messages, setMessages] = useState([]);
  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [showCall, setShowCall] = useState(false);
  const [userAvatars, setUserAvatars] = useState({}); // Store user avatars
  const scrollViewRef = useRef(null);
  const socketRef = useRef(null);
  const [setupError, setSetupError] = useState(false);
  const navigation = useNavigation();
  const [coachName, setCoachName] = useState("");
  const sessionIdRef = useRef(null);

  useEffect(() => {
    const setupChat = async () => {
      try {
        console.log("🔍 Current user data:", user);
        console.log("🔍 Current user avatar:", user?.avatar);

        const response = await getOrCreateSession(token);
        console.log("getOrCreateSession response:", response.data);
        if (!response || !response.data) {
          setSetupError(true);
          return;
        }
        const sessionData = response.data; // SỬA Ở ĐÂY
        setSession(sessionData); // Lưu object session
        const sid = sessionData._id; // SỬA Ở ĐÂY
        if (!sid) {
          setSetupError(true);
          console.error("Không lấy được session id", sessionData);
          return;
        }
        setSessionId(sid);
        sessionIdRef.current = sid; // Lưu sessionId vào ref

        const msgRes = await getMessages(token, sid);
        console.log("getMessages response:", msgRes);
        if (!msgRes || !msgRes.data) {
          setSetupError(true);
          console.error("Response getMessages:", msgRes);
          return;
        }
        const messagesData = msgRes.data;
        setMessages(messagesData);

        // Extract unique user IDs and fetch their avatars
        const userIds = [
          ...new Set(
            messagesData
              .map((msg) => {
                const senderId = msg.user_id?._id || msg.user_id;
                return senderId;
              })
              .filter(Boolean)
          ),
        ];
        fetchUserAvatars(userIds);

        socketRef.current = io(`${SOCKET_URL}/coach`, {
          auth: { token },
        });

        socketRef.current.on("connect", () => {
          socketRef.current.emit("joinSession", sid);
        });

        socketRef.current.on("newMessage", (msg) => {
          setMessages((prev) => [...prev, msg]);
          // Fetch avatar for new message sender
          const senderId = msg.user_id?._id || msg.user_id;
          if (senderId && !userAvatars[senderId]) {
            fetchUserAvatars([senderId]);
          }
        });
      } catch (err) {
        setSetupError(true);
        console.error("Lỗi setup chat:", err);
      }
    };

    setupChat();
    return () => {
      socketRef.current?.disconnect();
    };
  }, []); // Mảng dependency rỗng để chỉ chạy một lần

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const fetchUserAvatars = async (userIds) => {
    try {
      console.log("🔍 Fetching avatars for user IDs:", userIds);
      const avatarPromises = userIds.map(async (userId) => {
        try {
          console.log(`🔍 Fetching user ${userId}...`);
          const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(`🔍 Response status for ${userId}:`, response.status);
          if (response.ok) {
            const userData = await response.json();
            console.log(`🔍 User data for ${userId}:`, userData);
            return { userId, avatar: userData.avatar };
          } else {
            console.log(`❌ Response not ok for ${userId}:`, response.status);
          }
        } catch (error) {
          console.log(`❌ Error fetching avatar for user ${userId}:`, error);
        }
        return { userId, avatar: null };
      });

      const avatarResults = await Promise.all(avatarPromises);
      console.log("🔍 Avatar results:", avatarResults);
      const avatarMap = {};
      avatarResults.forEach(({ userId, avatar }) => {
        if (avatar) avatarMap[userId] = avatar;
      });

      setUserAvatars((prev) => ({ ...prev, ...avatarMap }));
      console.log("✅ CoachChat user avatars loaded:", avatarMap);
    } catch (error) {
      console.log("❌ Error fetching user avatars:", error);
    }
  };

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
        <TouchableOpacity
          onPress={() => {
            if (session?.coach_id?._id) {
              navigation.navigate("ProfileCoachScreen", { id: session.coach_id._id });
            }
          }}
          style={styles.headerTitleContainer}
        >
          <Text style={styles.headerTitle}>
            {session?.coach_id?.full_name
              ? session.coach_id.full_name
              : "Chat với Coach"}
          </Text>
        </TouchableOpacity>
        {!setupError && (
          <TouchableOpacity
            style={styles.videoBtn}
            onPress={() => {
              const coachId =
                session?.coach_id?._id || session?.coach_id || user?._id;
              let memberId = session?.user_id?._id || session?.user_id;
              // Nếu chưa có, thử lấy từ messages
              if (!memberId && messages.length > 0) {
                for (let msg of messages) {
                  const senderId = msg.user_id?._id || msg.user_id;
                  if (String(senderId) !== String(coachId)) {
                    memberId = senderId;
                    break;
                  }
                }
              }
              if (coachId && memberId) {
                const shortCoach = String(coachId)
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .slice(-4);
                const shortMember = String(memberId)
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .slice(-4);
                const roomName = `c${shortCoach}m${shortMember}`.toLowerCase(); // Đảm bảo luôn là chữ thường, không dấu cách
                console.log("roomName truyền vào:", roomName);
                navigation.navigate("VideoCallScreen", { roomName });
              } else {
                alert("Không tìm thấy coachId hoặc memberId!");
              }
            }}
          >
            <Icon name="video" size={20} color="#fff" />
            <Text style={styles.videoBtnText}>Gọi video</Text>
          </TouchableOpacity>
        )}
      </View>
      {setupError ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              color: "#ef4444",
              fontSize: 16,
              textAlign: "center",
              padding: 24,
            }}
          >
            Hãy kiểm tra hội viên hoặc quitplan để trò chuyện với coach
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.messages}
            ref={scrollViewRef}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg, idx) => {
              const senderId =
                (msg.user_id && (msg.user_id._id || msg.user_id)) ||
                (msg.author && msg.author._id);

              const senderName =
                msg.author?.full_name || msg.user_id?.full_name || "Coach";

              const isOwn = String(senderId) === String(currentUserId);

              const avatar = getAvatarText(senderName);

              // Get avatar for this specific user by ID
              let userAvatar = userAvatars[senderId];
              if (!userAvatar && isOwn && user?.avatar) {
                userAvatar = user.avatar; // Use current user avatar for own messages
              }
              console.log(
                "🔍 CoachChat user avatar for ID",
                senderId,
                ":",
                userAvatar,
                "isOwn:",
                isOwn
              );

              return (
                <View
                  key={idx}
                  style={[
                    styles.messageRow,
                    isOwn ? styles.ownMessage : styles.otherMessage,
                  ]}
                >
                  {!isOwn && (
                    <View style={styles.avatar}>
                      {userAvatar ? (
                        <Image
                          source={{ uri: userAvatar }}
                          style={styles.avatarImage}
                          onError={(error) => {
                            console.log(
                              "❌ CoachChat avatar loading error:",
                              error.nativeEvent
                            );
                          }}
                          defaultSource={require("../../assets/icon.png")}
                        />
                      ) : (
                        <Text style={styles.avatarText}>{avatar}</Text>
                      )}
                    </View>
                  )}

                  <View>
                    <View
                      style={[
                        styles.messageBubble,
                        isOwn ? styles.ownBubble : styles.otherBubble,
                      ]}
                    >
                      <Text style={styles.messageText}>{msg.content}</Text>
                    </View>
                    <Text
                      style={[
                        styles.timestamp,
                        { textAlign: isOwn ? "right" : "left" },
                      ]}
                    >
                      {msg.sent_at
                        ? new Date(msg.sent_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </Text>
                  </View>

                  {isOwn && (
                    <View style={styles.avatar}>
                      {userAvatar ? (
                        <Image
                          source={{ uri: userAvatar }}
                          style={styles.avatarImage}
                          onError={(error) => {
                            console.log(
                              "❌ CoachChat avatar loading error:",
                              error.nativeEvent
                            );
                          }}
                          defaultSource={require("../../assets/icon.png")}
                        />
                      ) : (
                        <Text style={styles.avatarText}>{avatar}</Text>
                      )}
                    </View>
                  )}
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#4f8cff",
    width: "100%",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  videoBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  videoBtnText: {
    color: "#fff",
    marginLeft: 6,
  },
  messages: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    width: "100%",
  },
  message: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
    maxWidth: "80%",
  },
  ownMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
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
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageContent: {
    flexShrink: 1,
  },
  author: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
    fontSize: 14,
  },
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
  messageText: {
    fontSize: 15,
    color: "#111",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    width: "100%",
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
  sendBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#ef4444",
    padding: 8,
    borderRadius: 8,
  },
  closeBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex",
    marginVertical: 4,
    maxWidth: "90%",
  },
  ownMessage: { alignSelf: "flex-end" },
  otherMessage: { alignSelf: "flex-start" },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default CoachChat;
