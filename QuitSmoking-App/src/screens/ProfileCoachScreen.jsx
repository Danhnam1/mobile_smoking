import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { Avatar } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FeedBackService } from "../api/feedback";
// import { UserService } from '../services/user.service';
import { fetchUser } from "../api/user"; // Import fetchUser
import { Rating } from "react-native-ratings";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth
import { SafeAreaView } from "react-native-safe-area-context";
const ProfileCoachScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const { token } = useAuth(); // Get token from useAuth

  const [coach, setCoach] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // const token = await AsyncStorage.getItem('access_token'); // Use token from context
      try {
        const [coachRes, fbRes] = await Promise.all([
          fetchUser(id, token), // Pass id and token to fetchUser
          FeedBackService.getFeedbacksByCoach(token, id),
        ]);
        console.log("feedback", fbRes);
        setCoach(coachRes);
        setFeedbacks(Array.isArray(fbRes) ? fbRes : []);
      } catch (err) {
        Alert.alert("Lỗi", "Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]); // Add token to dependency array

  const handleSendFeedback = async () => {
    if (!myComment.trim()) {
      Alert.alert("Thiếu nội dung", "Vui lòng nhập nội dung đánh giá.");
      return;
    }
    setSending(true);
    console.log("token cho nay", token);
    try {
      await FeedBackService.createFeedbackCoach(token, id, myRating, myComment);
      setMyRating(5);
      setMyComment("");
      Alert.alert("Thành công", "Đã gửi đánh giá.");
      const fbRes = await FeedBackService.getFeedbacksByCoach(token, id);
      setFeedbacks(Array.isArray(fbRes) ? fbRes : []);
    } catch (err) {
      Alert.alert("Lỗi", "Gửi đánh giá thất bại.");
    } finally {
      setSending(false);
    }
  };

  const validFeedbacks = feedbacks.filter(
    (fb) => typeof fb.rating === "number" && !isNaN(fb.rating)
  );
  const avgRating = validFeedbacks.length
    ? validFeedbacks.reduce((a, b) => a + b.rating, 0) / validFeedbacks.length
    : 0;

  if (loading)
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" />;

  if (!coach)
    return <Text style={{ margin: 20 }}>Không tìm thấy huấn luyện viên.</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.profileBox}>
          <Avatar.Image size={100} source={{ uri: coach.avatar }} />
          <Text style={styles.name}>{coach.full_name}</Text>
          <Text style={styles.field}>{coach.field || "Chưa cập nhật"}</Text>
          <Text style={styles.ratingText}>
            {validFeedbacks.length
              ? `${avgRating.toFixed(1)} / 5 (${
                  validFeedbacks.length
                } đánh giá)`
              : "Chưa có đánh giá"}
          </Text>
          <Rating
            type="custom"
            imageSize={20}
            readonly
            startingValue={avgRating}
            tintColor="#eef6ff" // Cho cùng màu với nền
            style={{ marginTop: 8 }}
          />
        </View>

        <View style={styles.feedbackForm}>
          <Text style={styles.sectionTitle}>Gửi feedback cho coach</Text>
          <Rating
            startingValue={myRating}
            imageSize={24}
            onFinishRating={(val) => setMyRating(val)}
            style={{ marginVertical: 10 }}
          />
          <TextInput
            style={styles.textInput}
            value={myComment}
            onChangeText={setMyComment}
            placeholder="Nhập nội dung đánh giá..."
            multiline
          />
          <Button
            title="Gửi đánh giá"
            onPress={handleSendFeedback}
            disabled={sending}
          />
        </View>

        <View style={styles.feedbackList}>
          <Text style={styles.sectionTitle}>Feedback từ học viên</Text>
          {validFeedbacks.map((fb, index) => (
            <View key={index} style={styles.feedbackItem}>
              <Text style={styles.feedbackName}>
                {fb.user_id?.full_name || "Ẩn danh"}
              </Text>
              <Text style={styles.feedbackComment}>{fb.comment}</Text>
              <Rating
                type="custom"
                readonly
                startingValue={fb.rating}
                imageSize={18}
                tintColor="#fafafa"
                style={{ marginTop: 4 }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  profileBox: {
    alignItems: "center",
    backgroundColor: "#eef6ff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "600", // nhẹ hơn bold chút
    marginTop: 12,
    color: "#1f2937",
  },
  field: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    marginTop: 8,
    color: "#16a34a",
    fontWeight: "500",
  },
  feedbackForm: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 18 },
  textInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
    minHeight: 60,
  },
  feedbackList: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    elevation: 1,
    shadowColor: "#ccc",
    marginBottom: 40,
  },
  feedbackItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
  },
  feedbackName: { fontWeight: "bold", fontSize: 16 },
  feedbackComment: { marginTop: 4, color: "#333" },
});

export default ProfileCoachScreen;
