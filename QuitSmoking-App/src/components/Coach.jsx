import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllCoaches } from "../api/user";
import { useAuth } from "../contexts/AuthContext";

const Coach = ({ setSelectedCoachId, setSelectedCoach }) => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setLocalSelectedCoach] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const coachesData = await getAllCoaches(token);
      setCoaches(coachesData);
      console.log("Coaches loaded:", coachesData.length);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      // Don't show alert, just log the error
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCoachSelection = (coach) => {
    setSelectedCoach && setSelectedCoach(coach);
    setSelectedCoachId && setSelectedCoachId(coach._id);
    setLocalSelectedCoach(coach); // Đảm bảo luôn set object coach nếu prop truyền vào
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải danh sách coaches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Chọn Coach</Text>
      <Text style={styles.sectionDescription}>
        Chọn một coach để hỗ trợ bạn trong quá trình bỏ thuốc
      </Text>

      <ScrollView
        style={styles.coachesContainer}
        showsVerticalScrollIndicator={false}
      >
        {coaches.length === 0 ? (
          <View style={styles.noCoachesContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.noCoachesText}>Hiện chưa có coach nào</Text>
            <Text style={styles.noCoachesSubtext}>
              Coach sẽ được thêm vào hệ thống sớm nhất
            </Text>
          </View>
        ) : (
          coaches.map((coach) => (
            <TouchableOpacity
              key={coach._id}
              style={[
                styles.coachCard,
                selectedCoach?._id === coach._id && styles.selectedCoachCard,
              ]}
              onPress={() => handleCoachSelection(coach)}
            >
              <View style={styles.coachInfo}>
                {coach.avatar ? (
                  <Image
                    source={{ uri: coach.avatar }}
                    style={styles.coachAvatarImage}
                  />
                ) : (
                  <View style={styles.coachAvatar}>
                    <Ionicons name="person" size={24} color="#4CAF50" />
                  </View>
                )}
                <View style={styles.coachDetails}>
                  <Text style={styles.coachName}>{coach.full_name}</Text>
                  <Text style={styles.coachEmail}>{coach.email}</Text>
                  <Text style={styles.coachRole}>Coach</Text>
                </View>
                <View style={styles.selectionIndicator}>
                  {selectedCoach?._id === coach._id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#4CAF50"
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    lineHeight: 20,
  },
  coachesContainer: {
    maxHeight: 200,
  },
  noCoachesContainer: {
    alignItems: "center",
    padding: 20,
  },
  noCoachesText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  noCoachesSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
  },
  coachCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCoachCard: {
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "#F1F8E9",
  },
  coachInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  coachAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  coachAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  coachDetails: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  coachEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  coachRole: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  selectionIndicator: {
    marginLeft: 10,
  },
});

export default Coach;
