import React, { useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const SUCCESS_URL = "quitsmokingapp://checkout/success";
const CANCEL_URL = "quitsmokingapp://checkout/cancel";

const PayPalWebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { url: approveUrl } = route.params;

  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Prefetch DNS for PayPal domains
  React.useEffect(() => {
    const prefetchDNS = async () => {
      try {
        // Prefetch PayPal domains
        const paypalDomains = [
          "www.sandbox.paypal.com",
          "www.paypal.com",
          "sandbox.paypal.com",
          "paypal.com",
        ];

        console.log("🔍 Prefetching DNS for PayPal domains...");
        // This is just for logging - actual DNS prefetch happens in WebView
      } catch (error) {
        console.log("⚠️ DNS prefetch warning:", error.message);
      }
    };

    prefetchDNS();
  }, []);

  const onShouldStartLoadWithRequest = (request) => {
    const { url } = request;
    if (!url) return false;

    console.log("Intercepting URL:", url);

    // Chặn srcdoc nếu có
    if (url === "about:srcdoc") {
      return false;
    }

    // Thành công
    if (url.startsWith(SUCCESS_URL)) {
      console.log("Detected success redirect");
      setIsProcessing(true);

      (async () => {
        try {
          const urlObj = new URL(url);
          const orderId = urlObj.searchParams.get("token");
          const pendingPackageJSON = await AsyncStorage.getItem(
            "pendingPackageData"
          );
          const packageData = pendingPackageJSON
            ? JSON.parse(pendingPackageJSON)
            : null;

          if (orderId && packageData) {
            navigation.replace("Checkout", { orderId, packageData });
          } else {
            throw new Error("Không tìm thấy đơn hàng hoặc gói thanh toán");
          }
        } catch (err) {
          console.error("Lỗi xử lý thanh toán:", err);
          Alert.alert("Lỗi", "Xử lý thanh toán thất bại.");
          navigation.goBack();
        }
      })();

      return false;
    }

    // Hủy thanh toán
    if (url.startsWith(CANCEL_URL)) {
      console.log("Detected cancel redirect");
      (async () => {
        await AsyncStorage.removeItem("pendingPackageData");
        navigation.goBack();
      })();
      return false;
    }

    return true;
  };

  const onError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    setHasError(true);
    setErrorMessage(nativeEvent.description || "Không thể tải trang PayPal");
  };

  const onHttpError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView HTTP error:", nativeEvent);
    setHasError(true);
    setErrorMessage(`HTTP Error: ${nativeEvent.statusCode}`);
  };

  const retryPayment = () => {
    setHasError(false);
    setErrorMessage("");

    // Add delay before retry to allow DNS resolution
    setTimeout(() => {
      console.log("🔄 Retrying PayPal payment...");
      // WebView sẽ tự động reload
    }, 1000);
  };

  const goBack = () => {
    Alert.alert("Hủy thanh toán", "Bạn có chắc muốn hủy thanh toán?", [
      { text: "Tiếp tục", style: "cancel" },
      {
        text: "Hủy",
        onPress: async () => {
          await AsyncStorage.removeItem("pendingPackageData");
          navigation.goBack();
        },
      },
    ]);
  };

  if (!approveUrl) {
    Alert.alert("Lỗi", "Không tìm thấy đường dẫn PayPal.");
    navigation.goBack();
    return null;
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="wifi-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Lỗi kết nối</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <Text style={styles.errorSubtext}>
          Vui lòng kiểm tra kết nối internet và thử lại
        </Text>
        <View style={styles.errorButtons}>
          <TouchableOpacity style={styles.retryButton} onPress={retryPayment}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={goBack}>
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ uri: approveUrl }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onError={onError}
        onHttpError={onHttpError}
        style={styles.webview}
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36"
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.loadingText}>Đang tải PayPal...</Text>
          </View>
        )}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        cacheEnabled={false}
        incognito={true}
      />
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.processingText}>Đang xử lý thanh toán...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6C63FF",
    fontWeight: "600",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6C63FF",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#343A40",
    marginTop: 20,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#ADB5BD",
    textAlign: "center",
    marginBottom: 30,
  },
  errorButtons: {
    flexDirection: "row",
    gap: 15,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6C757D",
  },
  cancelButtonText: {
    color: "#6C757D",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PayPalWebViewScreen;
