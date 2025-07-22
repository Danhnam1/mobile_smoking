// CoachUserScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { CoachUserService } from "../api/coachuser";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const CoachUserScreen = () => {
  const { user, token } = useAuth();
  const [relations, setRelations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    CoachUserService.getRelations(token, user._id)
      .then((res) => {
        setRelations(res || []);
      })
      .catch((err) => {
        console.error("Không thể lấy danh sách user:", err);
      });
  }, [user]);

  const filtered = relations.filter((rel) => {
    const user = rel?.user_id;
    if (!user || !user.full_name || !user.email) return false;
    const term = searchTerm.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  const renderItem = ({ item }) => {
    const user = item.user_id;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("CoachUserDetail", { userId: item._id })
        }
      >
        <View style={styles.cardHeader}>
          <Icon name="user" size={20} color="#4ECB71" />
          <Text style={styles.name}>{user?.full_name || "Không rõ"}</Text>
        </View>
        <Text style={styles.email}>{user?.email || "Không có email"}</Text>
        <Text style={styles.date}>
          <Icon name="calendar" size={12} />{" "}
          {user?.created_at
            ? new Date(user.created_at).toLocaleDateString()
            : "Không rõ ngày"}
        </Text>
        <View style={{ marginTop: 8 }}>
          <Text style={styles.section}>Quit Plans:</Text>
          {item.quitPlans && item.quitPlans.length > 0 ? (
            item.quitPlans.map((plan, idx) => (
              <Text key={idx} style={styles.planText}>
                • {plan.goal || "Không có tên goal"}{" "}
                {plan.status ? `(${plan.status})` : ""}
              </Text>
            ))
          ) : (
            <Text style={styles.noPlans}>Không có kế hoạch</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>📋 Khách hàng của bạn</Text>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {filtered.length === 0 ? (
          <View style={styles.noClientsContainer}>
            <Text style={styles.noClientsText}>Không tìm thấy khách hàng nào.</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1f2937",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
  email: {
    fontSize: 14,
    color: "#555",
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  section: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
    color: "#222",
  },
  planText: {
    fontSize: 13,
    color: "#444",
    marginLeft: 8,
    marginBottom: 2,
  },
  noPlans: {
    fontStyle: "italic",
    color: "#bbb",
    marginLeft: 8,
  },
  noClientsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noClientsText: {
    fontSize: 16,
    color: "#888",
  },
});

export default CoachUserScreen;
