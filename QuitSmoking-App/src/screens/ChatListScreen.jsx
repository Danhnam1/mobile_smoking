import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { getSessionByCoach } from "../api/chat";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../config/config";

export default function ChatListScreen({ navigation }) {
  const { token } = useAuth();
  const [chatList, setChatList] = useState([]);
  const [userAvatars, setUserAvatars] = useState({}); // Store user avatars

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [])
  );

  const fetchUserAvatars = async (userIds) => {
    try {
      console.log("🔍 ChatList: Fetching avatars for user IDs:", userIds);
      const avatarPromises = userIds.map(async (userId) => {
        try {
          console.log(`🔍 ChatList: Fetching user ${userId}...`);
          const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(
            `🔍 ChatList: Response status for ${userId}:`,
            response.status
          );
          if (response.ok) {
            const userData = await response.json();
            console.log(`🔍 ChatList: User data for ${userId}:`, userData);
            return { userId, avatar: userData.avatar };
          } else {
            console.log(
              `❌ ChatList: Response not ok for ${userId}:`,
              response.status
            );
          }
        } catch (error) {
          console.log(
            `❌ ChatList: Error fetching avatar for user ${userId}:`,
            error
          );
        }
        return { userId, avatar: null };
      });

      const avatarResults = await Promise.all(avatarPromises);
      console.log("🔍 ChatList: Avatar results:", avatarResults);
      const avatarMap = {};
      avatarResults.forEach(({ userId, avatar }) => {
        if (avatar) avatarMap[userId] = avatar;
      });

      setUserAvatars(avatarMap);
      console.log("✅ ChatList: User avatars loaded:", avatarMap);
    } catch (error) {
      console.log("❌ ChatList: Error fetching user avatars:", error);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await getSessionByCoach(token);
      console.log(res.data);
      const chatData = res?.data || [];
      setChatList(chatData);

      // Extract unique user IDs and fetch their avatars
      const userIds = [
        ...new Set(chatData.map((item) => item.user_id?._id).filter(Boolean)),
      ];
      fetchUserAvatars(userIds);
    } catch (err) {
      console.error("Không thể tải danh sách chat", err);
    }
  };

  const getAvatarText = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 0) return "?";
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách trò chuyện</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={chatList.filter((item) => item.user_id)}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          // Get avatar for this specific user by ID
          const userId = item.user_id?._id;
          const userAvatar = userAvatars[userId];
          console.log(
            "🔍 ChatList user avatar for ID",
            userId,
            ":",
            userAvatar
          );

          return (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                navigation.navigate("ChatDetail", { session: item })
              }
            >
              {userAvatar ? (
                <Image
                  source={{ uri: userAvatar }}
                  style={styles.avatarImage}
                  onError={(error) => {
                    console.log(
                      "❌ ChatList avatar loading error:",
                      error.nativeEvent
                    );
                  }}
                  defaultSource={require("../../assets/icon.png")}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getAvatarText(item.user_id?.full_name || "Không rõ")}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.name}>
                  {item.user_id?.full_name || "Không rõ"}
                </Text>
                <Text style={styles.email}>{item.user_id?.email || ""}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#4f8cff",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  list: {
    padding: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4ECB71",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold" },
  name: { fontSize: 16, fontWeight: "bold" },
  email: { fontSize: 12, color: "#555" },
});
