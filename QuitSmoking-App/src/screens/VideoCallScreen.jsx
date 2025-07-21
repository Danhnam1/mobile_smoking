import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";

const { JITSI_APP_ID, JITSI_ROOM_DEFAULT, JITSI_JWT_TOKEN } =
  Constants.expoConfig.extra;

const VideoCallScreen = ({ route, navigation }) => {
  const { user, token } = useAuth();
  const [roomUrl, setRoomUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // JaaS AppID và JWT token (hardcode để test)
  const appId = JITSI_APP_ID;
  const roomName = route?.params?.roomName || JITSI_ROOM_DEFAULT; // Lấy roomName động từ params
  const jwtToken = JITSI_JWT_TOKEN;

  useEffect(() => {
    const url = `https://8x8.vc/${appId}/${roomName}#jwt=${jwtToken}`;
    setRoomUrl(url);
    setLoading(false);
  }, [roomName]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12 }}>Đang chuẩn bị phòng họp...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={{ color: "#fff" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!roomUrl) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy phòng họp</Text>
      </View>
    );
  }

  // Sử dụng WebView với roomUrl JaaS
  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: roomUrl }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  backBtn: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default VideoCallScreen;
