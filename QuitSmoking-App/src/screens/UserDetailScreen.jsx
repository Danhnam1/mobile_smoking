import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import gardenTheme from "../const/gardenTheme";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "../config/config";

// Helper function to format ISO date string to DD/MM/YYYY
const formatDateToDDMMYYYY = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to parse DD/MM/YYYY string to ISO date string
const parseDDMMYYYYToISO = (ddmmyyyyString) => {
  if (!ddmmyyyyString) return "";
  const parts = ddmmyyyyString.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    const date = new Date(Date.UTC(year, month, day)); // Use UTC to avoid timezone issues
    return date.toISOString();
  }
  return ""; // Return empty string if invalid format
};

// Helper: parse DD/MM/YYYY to YYYY-MM-DD
const parseDDMMYYYYToYMD = (ddmmyyyyString) => {
  if (!ddmmyyyyString) return "";
  const parts = ddmmyyyyString.split("/");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return "";
};

const UserDetailScreen = ({ navigation, route }) => {
  const { user, token, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    dateOfBirth: formatDateToDDMMYYYY(user?.birth_date) || "",
    gender: user?.gender || "",
  });
  const [avatarUri, setAvatarUri] = useState(user?.avatar || null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.fullName || !formData.email) {
        Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      const form = new FormData();
      form.append("full_name", formData.fullName);
      form.append("birth_date", parseDDMMYYYYToYMD(formData.dateOfBirth));
      form.append("gender", formData.gender);

      if (avatarUri && !avatarUri.startsWith("http")) {
        const filename = avatarUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        if (type === "image/jpg") type = "image/jpeg";

        form.append("avatar", {
          uri: avatarUri,
          name: filename,
          type,
        });
      }

      // Log FormData for debugging
      for (let pair of form._parts) {
        console.log(pair[0], pair[1]);
      }

      const res = await axios.put(`${API_BASE_URL}/users/me`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      updateUserProfile(res.data);
      Alert.alert("Thành công", "Thông tin cá nhân đã được cập nhật", [
        {
          text: "OK",
          onPress: () => {
            if (route.params?.fromProfileEdit) {
              navigation.goBack();
            } else {
              navigation.navigate("SmokingStatus");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Lỗi",
        error.message || "Không thể cập nhật thông tin cá nhân"
      );
    }
  };

  return (
    <LinearGradient
      colors={[
        gardenTheme.colors.backgroundSoft,
        gardenTheme.colors.background,
      ]}
      style={styles.gradientBg}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Thông tin cá nhân</Text>

          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <Ionicons name="person-circle" size={100} color="#ccc" />
              )}
            </TouchableOpacity>
            <Text style={styles.avatarText}>Chạm để đổi ảnh đại diện</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên *</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange("fullName", value)}
              placeholder="Nhập họ và tên"
              placeholderTextColor={gardenTheme.colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Nhập email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={gardenTheme.colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TextInput
              style={styles.input}
              value={formData.dateOfBirth}
              onChangeText={(value) => handleInputChange("dateOfBirth", value)}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={gardenTheme.colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <TextInput
              style={styles.input}
              value={formData.gender}
              onChangeText={(value) => handleInputChange("gender", value)}
              placeholder="Nhập giới tính"
              placeholderTextColor={gardenTheme.colors.textSecondary}
            />
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#b9f6ca", "#43e97b"]}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>Lưu thông tin</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 32,
  },
  formContainer: {
    padding: 28,
    backgroundColor: gardenTheme.colors.card,
    borderRadius: gardenTheme.borderRadius.card,
    ...gardenTheme.shadow.card,
    margin: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: gardenTheme.fontWeight.bold,
    marginBottom: 28,
    color: gardenTheme.colors.primary,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: gardenTheme.colors.textSecondary,
    fontWeight: gardenTheme.fontWeight.medium,
  },
  input: {
    backgroundColor: gardenTheme.colors.background,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    fontSize: 16,
    color: gardenTheme.colors.text,
  },
  submitButton: {
    borderRadius: gardenTheme.borderRadius.button,
    marginTop: 32,
    overflow: "hidden",
    elevation: 3,
    alignSelf: "center",
    width: "100%",
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: gardenTheme.borderRadius.button,
    width: "100%",
  },
  submitButtonText: {
    color: gardenTheme.colors.white,
    textAlign: "center",
    fontSize: 18,
    fontWeight: gardenTheme.fontWeight.bold,
    letterSpacing: 0.5,
    backgroundColor: "transparent",
  },
});

export default UserDetailScreen;
