import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUCCESS_URL = 'quitsmokingapp://checkout/success';
const CANCEL_URL = 'quitsmokingapp://checkout/cancel';

const PayPalWebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { url: approveUrl } = route.params;

  const [isProcessing, setIsProcessing] = useState(false);

  const onShouldStartLoadWithRequest = (request) => {
    const { url } = request;
    if (!url) return false;

    console.log('Intercepting URL:', url);

    // Chặn srcdoc nếu có
    if (url === 'about:srcdoc') {
      return false;
    }

    // Thành công
    if (url.startsWith(SUCCESS_URL)) {
      console.log('Detected success redirect');
      setIsProcessing(true);

      (async () => {
        try {
          const urlObj = new URL(url);
          const orderId = urlObj.searchParams.get('token');
          const pendingPackageJSON = await AsyncStorage.getItem('pendingPackageData');
          const packageData = pendingPackageJSON ? JSON.parse(pendingPackageJSON) : null;

          if (orderId && packageData) {
            navigation.replace('Checkout', { orderId, packageData });
          } else {
            throw new Error('Không tìm thấy đơn hàng hoặc gói thanh toán');
          }
        } catch (err) {
          console.error('Lỗi xử lý thanh toán:', err);
          Alert.alert('Lỗi', 'Xử lý thanh toán thất bại.');
          navigation.goBack();
        }
      })();

      return false;
    }

    // Hủy thanh toán
    if (url.startsWith(CANCEL_URL)) {
      console.log('Detected cancel redirect');
      (async () => {
        await AsyncStorage.removeItem('pendingPackageData');
        navigation.goBack();
      })();
      return false;
    }

    return true;
  };

  if (!approveUrl) {
    Alert.alert('Lỗi', 'Không tìm thấy đường dẫn PayPal.');
    navigation.goBack();
    return null;
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ uri: approveUrl }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        style={styles.webview}
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36"
      />
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6C63FF" />
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PayPalWebViewScreen;
