import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { getSessionByCoach } from "../api/chat";
import { useAuth } from "../contexts/AuthContext";

export default function ChatListScreen({ navigation }) {
  const { token } = useAuth();
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await getSessionByCoach(token);
      setChatList(res?.data || []);
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
        data={chatList}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("ChatDetail", { session: item })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getAvatarText(item.user_id.full_name)}
              </Text>
            </View>
            <View>
              <Text style={styles.name}>{item.user_id.full_name}</Text>
              <Text style={styles.email}>{item.user_id.email}</Text>
            </View>
          </TouchableOpacity>
        )}
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
  avatarText: { color: "#fff", fontWeight: "bold" },
  name: { fontSize: 16, fontWeight: "bold" },
  email: { fontSize: 12, color: "#555" },
});
