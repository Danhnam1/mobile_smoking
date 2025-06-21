import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { PaymentService } from '../services/payment.service';
import { useFocusEffect } from '@react-navigation/native';

export const usePayment = (navigation) => {
    const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
    const [selectedPackageForPayment, setSelectedPackageForPayment] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal');
    const [currentPayPalOrderId, setCurrentPayPalOrderId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { user, updateMembershipStatus } = useAuth();
    const userId = user?._id;

    const clearPaymentOrder = useCallback(async () => {
        try {
            await AsyncStorage.removeItem('pendingPayPalOrder');
            setCurrentPayPalOrderId(null);
        } catch (error) {
            console.error('Error clearing payment order:', error);
        }
    }, []);

    const handlePaymentSuccess = useCallback(async () => {
        Alert.alert('🎉 Thanh toán thành công!', 'Gói thành viên của bạn đã được kích hoạt.', [{
            text: 'Tuyệt vời!',
            onPress: async () => {
                if (selectedPackageForPayment) {
                    await updateMembershipStatus({
                        package_id: selectedPackageForPayment._id,
                        package_name: selectedPackageForPayment.name,
                        start_date: new Date().toISOString(),
                        end_date: new Date(Date.now() + selectedPackageForPayment.duration_days * 24 * 60 * 60 * 1000).toISOString()
                    });
                }
                await clearPaymentOrder();
                navigation.navigate('Main', { screen: 'HomeTab' });
            }
        }]);
    }, [selectedPackageForPayment, updateMembershipStatus, clearPaymentOrder, navigation]);

    const captureAndConfirmPayment = useCallback(async (orderId) => {
        if (orderId && selectedPackageForPayment) {
            navigation.navigate('Checkout', { 
                orderId: orderId,
                packageData: selectedPackageForPayment 
            });
        } else {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin đơn hàng để xác nhận.');
        }
    }, [navigation, selectedPackageForPayment]);

    const initiatePayPalPayment = async (packageData) => {
        setIsProcessing(true);
        try {
            // Save the selected package data to AsyncStorage before navigating
            await AsyncStorage.setItem('pendingPackageData', JSON.stringify(packageData));

            const payload = {
                package_id: packageData._id,
                return_url: 'quitsmokingapp://checkout/success',
                cancel_url: 'quitsmokingapp://checkout/cancel',
            };

            const res = await PaymentService.createPaypalOrder(payload);

            if (res.approveUrl) {
                // Navigate to our new WebView screen instead of opening an external browser
                navigation.navigate('PayPalWebView', { url: res.approveUrl });
            } else {
                Alert.alert('Lỗi', 'Không nhận được URL thanh toán từ PayPal.');
            }
        } catch (err) {
            console.error('PayPal payment error:', err);
            // Show a more specific error if possible
            const errorMessage = err.message || 'Không thể bắt đầu thanh toán PayPal. Vui lòng thử lại.';
            Alert.alert('Lỗi thanh toán', errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const initiateMomoPayment = async () => {
        Alert.alert('Thanh toán Momo', 'Chức năng này đang được phát triển.', [{ text: 'OK' }]);
    };

    const handleSubscribe = async () => {
        if (!selectedPackageForPayment) return;
        setPaymentModalVisible(false);
        if (selectedPaymentMethod === 'paypal') {
            await initiatePayPalPayment(selectedPackageForPayment);
        } else if (selectedPaymentMethod === 'momo') {
            await initiateMomoPayment();
        }
    };
    
    const openPaymentModal = (pkg) => {
        setSelectedPackageForPayment(pkg);
        setPaymentModalVisible(true);
    };

    return {
        isPaymentModalVisible,
        setPaymentModalVisible,
        selectedPackageForPayment,
        openPaymentModal,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        handleSubscribe,
        isProcessing,
    };
}; 