import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaymentService } from '../services/payment.service';
import { useAuth } from '../contexts/AuthContext';

const CheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { updateMembershipStatus } = useAuth();

  // Get orderId and packageData from the navigation params
  const { orderId, packageData } = route.params || {};

  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'fail'

  useEffect(() => {
    const processPayment = async () => {
      // Thêm log chi tiết để kiểm tra dữ liệu
      console.log('--- BẮT ĐẦU XỬ LÝ THANH TOÁN ---');
      console.log('OrderId nhận được:', orderId);
      console.log('Dữ liệu gói nhận được:', JSON.stringify(packageData, null, 2));

      if (orderId) {
        console.log(`CheckoutScreen: Đang gửi yêu cầu capture cho PayPal orderId: ${orderId}`);
        try {
          // Gửi orderId tới backend để xác thực
          const res = await PaymentService.capturePaypalOrder({ orderId });
          console.log('Phản hồi từ server khi capture thành công:', res);
          
          setStatus('success');
          
          // NẾU THÀNH CÔNG, CẬP NHẬT TRẠNG THÁI THÀNH VIÊN
          // Ưu tiên sử dụng dữ liệu thành viên trả về từ server vì nó chính xác nhất.
          if (res && res.userMembership) {
            console.log('Đang cập nhật trạng thái thành viên từ dữ liệu server...', res.userMembership);
            await updateMembershipStatus(res.userMembership);
            console.log('Cập nhật trạng thái thành viên thành công.');
          } else {
             // Fallback nếu server không trả về userMembership (kịch bản cũ)
            if (packageData) {
              console.log('Server không trả về userMembership. Dùng packageData để cập nhật (fallback)...');
              await updateMembershipStatus({
                package_id: packageData._id,
                package_name: packageData.name,
                // Dữ liệu này có thể không chính xác 100% so với server
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + packageData.duration_days * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active' 
              });
              console.log('Cập nhật (fallback) thành công.');
            }
          }
        } catch (err) {
          // Log lỗi chi tiết hơn
          console.error('LỖI KHI CAPTURE THANH TOÁN:', err);
          const errorMessage = err.message || 'Đã có lỗi xảy ra từ server.';
          console.error(`Chi tiết lỗi: ${errorMessage}`);
          setStatus('fail');
        } finally {
          // Luôn dọn dẹp dữ liệu gói đang chờ
          console.log('Dọn dẹp pendingPackageData khỏi AsyncStorage.');
          await AsyncStorage.removeItem('pendingPackageData');
        }
      } else {
        console.error('CheckoutScreen: Không tìm thấy orderId trong route params.');
        setStatus('fail');
        await AsyncStorage.removeItem('pendingPackageData');
      }
      console.log('--- KẾT THÚC XỬ LÝ THANH TOÁN ---');
    };
    
    processPayment();
  }, [orderId, packageData, updateMembershipStatus]);

  const goHome = () => {
    navigation.navigate('Main', { screen: 'HomeTab' });
  };

  // Render different content based on the payment status
  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.statusText}>Đang xử lý thanh toán của bạn...</Text>
          </>
        );
      case 'success':
        return (
          <>
            <Ionicons name="checkmark-circle" size={80} color="#4ECB71" />
            <Text style={styles.title}>Thanh toán thành công!</Text>
            <Text style={styles.message}>Cảm ơn bạn đã mua hàng. Gói thành viên của bạn đã được kích hoạt.</Text>
            <TouchableOpacity onPress={goHome} style={styles.button}>
              <Text style={styles.buttonText}>Về trang chủ</Text>
            </TouchableOpacity>
          </>
        );
      case 'fail':
        return (
          <>
            <Ionicons name="close-circle" size={80} color="#FF6347" />
            <Text style={styles.title}>Thanh toán thất bại</Text>
            <Text style={styles.message}>Đã xảy ra sự cố khi hoàn tất thanh toán của bạn. Vui lòng thử lại hoặc liên hệ với bộ phận hỗ trợ.</Text>
            <TouchableOpacity onPress={goHome} style={styles.button}>
              <Text style={styles.buttonText}>Về trang chủ</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F4F6FB',
    },
    statusText: {
        marginTop: 20,
        fontSize: 18,
        color: '#6C63FF',
        fontWeight: '600',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#22223B',
        marginTop: 20,
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: '#4A4E69',
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#6C63FF',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
});

export default CheckoutScreen;
