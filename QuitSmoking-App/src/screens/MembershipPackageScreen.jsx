import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Platform, Dimensions, Linking } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { getMembershipPackages, createPayment, createPayPalOrder, capturePayPalOrder, getPayPalPaymentStatus } from '../api';
import { Picker } from '@react-native-picker/picker';
import { WebView } from 'react-native-webview';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import queryString from 'query-string';

const { width, height } = Dimensions.get('window');

const MembershipPackageScreen = ({ navigation, route }) => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
    const [selectedPackageForPayment, setSelectedPackageForPayment] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal');
    const [currentPayPalOrderId, setCurrentPayPalOrderId] = useState(null);

    const { user, token, updateMembershipStatus } = useAuth();

    const userId = user?._id;
    const userToken = token;

    // Functions to handle AsyncStorage for payment status
    const savePaymentOrder = async (orderId, packageData) => {
        try {
            const paymentData = {
                orderId,
                packageData,
                timestamp: new Date().toISOString(),
                userId
            };
            await AsyncStorage.setItem('pendingPayPalOrder', JSON.stringify(paymentData));
            console.log('Payment order saved to AsyncStorage:', orderId);
        } catch (error) {
            console.error('Error saving payment order to AsyncStorage:', error);
        }
    };

    const loadPaymentOrder = async () => {
        try {
            const paymentData = await AsyncStorage.getItem('pendingPayPalOrder');
            if (paymentData) {
                const parsed = JSON.parse(paymentData);
                // Only load if it's for the current user and not older than 24 hours
                if (parsed.userId === userId && 
                    new Date(parsed.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
                    setCurrentPayPalOrderId(parsed.orderId);
                    setSelectedPackageForPayment(parsed.packageData);
                    console.log('Loaded pending payment order from AsyncStorage:', parsed.orderId);
                } else {
                    // Clear old or invalid data
                    await AsyncStorage.removeItem('pendingPayPalOrder');
                }
            }
        } catch (error) {
            console.error('Error loading payment order from AsyncStorage:', error);
        }
    };

    const clearPaymentOrder = async () => {
        try {
            await AsyncStorage.removeItem('pendingPayPalOrder');
            setCurrentPayPalOrderId(null);
            console.log('Payment order cleared from AsyncStorage');
        } catch (error) {
            console.error('Error clearing payment order from AsyncStorage:', error);
        }
    };

    const fetchPackages = useCallback(async () => {
        if (!userToken) {
            console.log('fetchPackages: userToken is missing, cannot fetch packages.');
            // Optionally, handle this by showing an error or redirecting
            return;
        }
        try {
            setLoading(true);
            const data = await getMembershipPackages(userToken);
            setPackages(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching membership packages:", err);
            setError("Không thể tải gói thành viên. Vui lòng thử lại sau.");
            Alert.alert('Lỗi', 'Không thể tải gói thành viên. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    }, [userToken]);

    // useEffect for initial data fetch and logging
    useEffect(() => {
        console.log('MembershipPackageScreen: User object from AuthContext', user);
        console.log('MembershipPackageScreen: Token from AuthContext', token);
        if (userToken) {
            fetchPackages();
            loadPaymentOrder(); // Load any pending payment orders
        }
    }, [user, token, fetchPackages]);

    // useFocusEffect to check payment status when the screen is focused
    useFocusEffect(
        useCallback(() => {
            if (currentPayPalOrderId && userToken && userId) {
                console.log('Screen focused with pending PayPal order, checking status...');
                // Add a small delay to ensure the app is fully loaded
                const timer = setTimeout(() => {
                    handleCheckPaymentStatus();
                }, 1000);
                
                return () => clearTimeout(timer);
            }
        }, [currentPayPalOrderId, userToken, userId])
    );

    useEffect(() => {
        const handleDeepLink = async (event) => {
            const url = event.url;
            if (url.startsWith('myapp://paypal-success')) {
                // Lấy orderId từ url
                const parsed = queryString.parseUrl(url);
                const orderId = parsed.query.orderId;
                if (orderId) {
                    try {
                        setLoading(true);
                        const res = await capturePayPalOrder({ orderId }, userToken);
                        Alert.alert('🎉 Thành công', 'Thanh toán thành công! Gói của bạn đã được kích hoạt.');
                        await updateMembershipStatus({
                            package_id: res.userMembership.package_id,
                            package_name: 'pro',
                            start_date: res.userMembership.payment_date,
                            end_date: res.userMembership.expire_date
                        });
                        navigation.navigate('Main', { screen: 'HomeTab' });
                    } catch (err) {
                        Alert.alert('❌ Lỗi', 'Không xác nhận được thanh toán!');
                    } finally {
                        setLoading(false);
                    }
                }
            }
            if (url.startsWith('myapp://paypal-cancel')) {
                Alert.alert('❌ Đã hủy', 'Bạn đã hủy thanh toán PayPal.');
            }
        };

        Linking.addEventListener('url', handleDeepLink);
        Linking.getInitialURL().then((url) => {
            if (url) handleDeepLink({ url });
        });
        return () => Linking.removeEventListener('url', handleDeepLink);
    }, [userToken]);

    const initiatePayPalPayment = async (packageData, userToken, packageId) => {
        try {
            if (!packageData || !userToken || !packageId) {
                throw new Error('Thiếu thông tin cần thiết để tạo đơn hàng PayPal');
            }

            console.log('Initiating PayPal payment with:', {
                amount: packageData.price,
                package_id: packageId,
                userToken: userToken ? 'present' : 'missing'
            });

            const response = await createPayPalOrder({
                package_id: packageId
            }, userToken);

            if (!response || !response.approveUrl || !response.orderId) {
                throw new Error('Không nhận được URL xác nhận hoặc Order ID từ PayPal');
            }

            console.log('PayPal order created successfully:', {
                orderId: response.orderId,
                approveUrl: response.approveUrl
            });
            
            setCurrentPayPalOrderId(response.orderId);
            
            // Save payment order to AsyncStorage
            await savePaymentOrder(response.orderId, packageData);

            Linking.openURL(response.approveUrl);
            Alert.alert(
                '🔄 Chuyển hướng đến PayPal', 
                'Bạn sẽ được chuyển hướng đến PayPal để hoàn tất thanh toán.\n\nSau khi thanh toán xong, hãy quay lại ứng dụng để kiểm tra trạng thái và kích hoạt gói thành viên.',
                [{ text: 'Đã hiểu' }]
            );

        } catch (err) {
            console.error('PayPal payment error:', err);
            Alert.alert(
                'Lỗi PayPal',
                err.message || 'Không thể tạo đơn hàng PayPal. Vui lòng thử lại sau.',
                [{ text: 'OK' }]
            );
        }
    };

    const initiateMomoPayment = async (packageData, userToken, packageId) => {
        Alert.alert(
            'Thanh toán Momo',
            'Bạn sẽ được chuyển hướng đến Momo để hoàn tất thanh toán. (Chức năng này cần tích hợp backend thực tế)',
            [
                { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'HomeTab' }) }
            ]
        );
    };

    const handleSubscribe = async () => {
        console.log('handleSubscribe called');
        console.log('handleSubscribe - selectedPackageForPayment:', selectedPackageForPayment);
        console.log('handleSubscribe - userId:', userId);
        console.log('handleSubscribe - userToken:', userToken);

        if (!selectedPackageForPayment || !userId || !userToken) {
            Alert.alert('Lỗi', 'Thông tin gói thành viên hoặc người dùng không hợp lệ.');
            return;
        }

        try {
            if (selectedPaymentMethod === 'paypal') {
                setPaymentModalVisible(false);
                console.log('Payment modal set to false before PayPal initiation.');
                console.log('Calling initiatePayPalPayment...');
                await initiatePayPalPayment(selectedPackageForPayment, userToken, selectedPackageForPayment._id);
                console.log('initiatePayPalPayment finished.');
            } else if (selectedPaymentMethod === 'momo') {
                await initiateMomoPayment(selectedPackageForPayment, userToken, selectedPackageForPayment._id);
                setPaymentModalVisible(false);
                console.log('Payment modal set to false for Momo.');
            }

            await updateMembershipStatus({
                package_id: selectedPackageForPayment._id,
                package_name: selectedPackageForPayment.name,
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + selectedPackageForPayment.duration_days * 24 * 60 * 60 * 1000).toISOString()
            });

        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Đăng ký gói thành viên thất bại!');
            console.error('Error in handleSubscribe:', error);
        }
    };

    const handleCheckPaymentStatus = async () => {
        if (!currentPayPalOrderId || !userId || !userToken) {
            console.log('No PayPal order to check or missing credentials');
            return;
        }

        try {
            console.log('Checking payment status for order:', currentPayPalOrderId);
            
            // Show loading indicator
            Alert.alert('Đang kiểm tra', 'Vui lòng chờ trong giây lát...', [], { cancelable: false });
            
            const statusResponse = await getPayPalPaymentStatus(currentPayPalOrderId, userToken);
            
            console.log('Payment status response:', statusResponse);
            
            if (statusResponse && statusResponse.status) {
                const status = statusResponse.status.toLowerCase();
                
                if (status === 'completed' || status === 'success') {
                    // Payment successful
                    Alert.alert(
                        '🎉 Thanh toán thành công!',
                        'Gói thành viên của bạn đã được kích hoạt. Bạn có thể sử dụng tất cả tính năng premium ngay bây giờ.',
                        [
                            { 
                                text: 'Tuyệt vời!', 
                                onPress: async () => {
                                    // Update membership status in context
                                    if (selectedPackageForPayment) {
                                        updateMembershipStatus({
                                            package_id: selectedPackageForPayment._id,
                                            package_name: selectedPackageForPayment.name,
                                            start_date: new Date().toISOString(),
                                            end_date: new Date(Date.now() + selectedPackageForPayment.duration_days * 24 * 60 * 60 * 1000).toISOString()
                                        });
                                    }
                                    await clearPaymentOrder();
                                    navigation.navigate('Main', { screen: 'HomeTab' });
                                }
                            }
                        ]
                    );
                } else if (status === 'pending' || status === 'processing') {
                    // Payment still pending
                    Alert.alert(
                        '⏳ Thanh toán đang xử lý',
                        'Thanh toán của bạn đang được xử lý. Vui lòng kiểm tra lại sau vài phút.',
                        [
                            { text: 'Kiểm tra lại', onPress: () => handleCheckPaymentStatus() },
                            { text: 'Để sau', onPress: () => setCurrentPayPalOrderId(null) }
                        ]
                    );
                } else if (status === 'failed' || status === 'cancelled' || status === 'denied') {
                    // Payment failed
                    Alert.alert(
                        '❌ Thanh toán thất bại',
                        'Thanh toán của bạn không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.',
                        [
                            { text: 'Thử lại', onPress: async () => {
                                await clearPaymentOrder();
                                setPaymentModalVisible(true);
                            }},
                            { text: 'Để sau', onPress: async () => await clearPaymentOrder() }
                        ]
                    );
                } else {
                    // Unknown status
                    Alert.alert(
                        '❓ Trạng thái không xác định',
                        `Trạng thái thanh toán: ${statusResponse.status}. Vui lòng liên hệ hỗ trợ nếu cần thiết.`,
                        [
                            { text: 'Kiểm tra lại', onPress: () => handleCheckPaymentStatus() },
                            { text: 'Để sau', onPress: async () => await clearPaymentOrder() }
                        ]
                    );
                }
            } else {
                Alert.alert(
                    '⚠️ Không thể kiểm tra trạng thái',
                    'Không nhận được thông tin trạng thái thanh toán. Vui lòng thử lại sau.',
                    [
                        { text: 'Thử lại', onPress: () => handleCheckPaymentStatus() },
                        { text: 'Để sau', onPress: async () => await clearPaymentOrder() }
                    ]
                );
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            Alert.alert(
                '❌ Lỗi kiểm tra trạng thái',
                'Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
                [
                    { text: 'Thử lại', onPress: () => handleCheckPaymentStatus() },
                    { text: 'Để sau', onPress: async () => await clearPaymentOrder() }
                ]
            );
        }
    };

    const renderFeature = (iconName, text, isIncluded) => (
        <View style={styles.featureItem}>
            <Ionicons name={isIncluded ? "checkmark-circle" : "close-circle"} size={20} color={isIncluded ? "#4ECB71" : "#FF6347"} style={styles.featureIcon} />
            <Text style={styles.featureText}>{text}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#4ECB71" />
                <Text style={styles.loadingText}>Đang tải gói thành viên...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchPackages}>
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const selectedPackageMonthlyPrice = selectedPackageForPayment ? (selectedPackageForPayment.price / (selectedPackageForPayment.duration_days / 30)).toFixed(0) : 0;
    
    const baseMonthlyPrice = 99000;

    let savingsPercentage = 0;
    let savingsAmount = 0;

    if (selectedPackageForPayment && selectedPackageForPayment.price > 0) {
        const durationInMonths = selectedPackageForPayment.duration_days / 30;
        if (durationInMonths > 1) {
            const theoreticalPrice = durationInMonths * baseMonthlyPrice;
            const actualPrice = selectedPackageForPayment.price;
            savingsAmount = theoreticalPrice - actualPrice;

            if (savingsAmount > 0) {
                savingsPercentage = ((savingsAmount / theoreticalPrice) * 100).toFixed(0);
            }
        }
    }

    console.log('--- Debugging Savings --- ', { selectedPackageForPayment, selectedPackageMonthlyPrice, baseMonthlyPrice, savingsAmount, savingsPercentage });

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>Chọn gói thành viên của bạn</Text>
            <Text style={styles.subtitle}>Nâng cấp để có thêm lợi ích và hỗ trợ!</Text>

            {packages.length === 0 && !loading && !error && (
                <View style={styles.noPackagesContainer}>
                    <Text style={styles.noPackagesText}>Hiện chưa có gói thành viên nào.</Text>
                </View>
            )}

            {packages.map((pkg) => (
                <View key={pkg._id} style={[styles.packageCard, pkg.name === 'pro' && styles.proPackageCard]}>
                    <View style={styles.packageHeader}>
                        <MaterialCommunityIcons name={pkg.name === 'pro' ? "crown" : "leaf"} size={30} color={pkg.name === 'pro' ? "#FFD700" : "#4ECB71"} />
                        <Text style={[styles.packageName, pkg.name === 'pro' && styles.proPackageName]}>{pkg.name === 'default' ? 'Mặc định' : pkg.name.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.packageDescription}>{pkg.description}</Text>
                    <Text style={styles.packagePrice}>{pkg.price === 0 ? 'Miễn phí' : `${pkg.price.toLocaleString()} VND`}</Text>
                    {pkg.duration_days && (
                        <Text style={styles.packageDuration}>Thời hạn: {pkg.duration_days} ngày</Text>
                    )}
                    <View style={styles.featuresContainer}>
                        {renderFeature("message-text", "Nhắn tin với huấn luyện viên", pkg.can_message_coach)}
                        {renderFeature("account-tie", "Chỉ định huấn luyện viên riêng", pkg.can_assign_coach)}
                        {renderFeature("notebook", "Sử dụng kế hoạch bỏ thuốc", pkg.can_use_quitplan)}
                        {renderFeature("bell", "Thiết lập nhắc nhở", pkg.can_use_reminder)}
                        {renderFeature("medal", "Kiếm huy hiệu đặc biệt", pkg.can_earn_special_badges)}
                    </View>
                    <TouchableOpacity 
                        style={styles.selectButton}
                        onPress={() => {
                            if (pkg.name === 'pro') {
                                setSelectedPackageForPayment(pkg);
                                setPaymentModalVisible(true);
                            } else {
                                navigation.navigate('Main', { screen: 'HomeTab' });
                            }
                        }}
                    >
                        <Text style={styles.selectButtonText}>Chọn gói này</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <TouchableOpacity style={styles.nextButton} onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}> 
                <Text style={styles.nextButtonText}>Skip (Comback to Home)</Text>
            </TouchableOpacity>

            {currentPayPalOrderId && (
                <View style={styles.paymentStatusContainer}>
                    <Text style={styles.paymentStatusText}>
                        ⏳ Bạn có đơn hàng PayPal đang chờ xử lý
                    </Text>
                    <TouchableOpacity 
                        style={styles.checkStatusButton}
                        onPress={handleCheckPaymentStatus}
                    >
                        <Text style={styles.checkStatusButtonText}>Kiểm tra trạng thái thanh toán</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={isPaymentModalVisible}
                onRequestClose={() => {
                    setPaymentModalVisible(!isPaymentModalVisible);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Xác nhận gói {selectedPackageForPayment?.name === 'default' ? 'Mặc định' : selectedPackageForPayment?.name.toUpperCase()}</Text>
                        
                        {selectedPackageForPayment && (
                            <View style={styles.modalDetailsContainer}>
                                <View style={styles.modalDetailRow}>
                                    <Text style={styles.modalDetailLabel}>{selectedPackageForPayment.duration_days / 30} tháng</Text>
                                    <Text style={styles.modalDetailValue}>Mỗi tháng: {selectedPackageMonthlyPrice.toLocaleString()} đ</Text>
                                </View>
                                {savingsPercentage > 0 && (
                                    <View style={styles.modalDetailRow}>
                                        <Text style={styles.modalDetailLabel}>Tổng cộng</Text>
                                        <Text style={styles.modalDetailValue}>Tiết kiệm {savingsPercentage}% ({savingsAmount.toLocaleString()} đ)</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        <Text style={styles.modalPrice}>Tổng cộng: {selectedPackageForPayment?.price.toLocaleString()} VND</Text>

                        <Text style={styles.paymentMethodLabel}>Chọn phương thức thanh toán</Text>
                        <View style={styles.paymentMethodPickerWrapper}>
                            <Picker
                                selectedValue={selectedPaymentMethod}
                                onValueChange={(itemValue) => setSelectedPaymentMethod(itemValue)}
                                style={styles.paymentMethodPicker}
                                itemStyle={styles.paymentMethodPickerItem}
                            >
                                <Picker.Item label="PayPal" value="paypal" />
                                <Picker.Item label="Momo" value="momo" />
                            </Picker>
                        </View>

                        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
                            <Text style={styles.subscribeButtonText}>Đăng ký</Text>
                        </TouchableOpacity>

                        <Text style={styles.cancelText}>Miễn phí hủy bỏ bất cứ lúc nào</Text>
                        <Text style={styles.infoText}>Đăng ký của bạn sẽ tự động gia hạn trừ khi bị hủy. Bạn có thể quản lý và hủy đăng ký trong cài đặt App Store của mình.</Text>
                        <Text style={styles.termsText}>Bằng cách tiếp tục, bạn đồng ý với <Text style={styles.linkText}>Điều khoản dịch vụ</Text>.</Text>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 32,
        paddingHorizontal: 16,
        backgroundColor: '#F4F6FB',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F6FB',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 18,
        color: '#6C63FF',
        fontWeight: '600',
    },
    errorText: {
        fontSize: 17,
        color: '#E74C3C',
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '600',
    },
    retryButton: {
        backgroundColor: '#6C63FF',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 12,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#22223B',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 17,
        color: '#4A4E69',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 25,
    },
    packageCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginBottom: 18,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
        borderWidth: 1.5,
        borderColor: '#E0E4F7',
    },
    proPackageCard: {
        borderColor: '#FFD700',
        borderWidth: 2.5,
        shadowColor: '#FFD700',
        shadowOpacity: 0.18,
        elevation: 12,
        backgroundColor: '#FFF9E5',
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    packageName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#22223B',
    },
    proPackageName: {
        color: '#FFD700',
        textShadowColor: '#FFF3B0',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    packageDescription: {
        fontSize: 16,
        color: '#4A4E69',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    packagePrice: {
        fontSize: 26,
        fontWeight: '900',
        color: '#6C63FF',
        marginBottom: 2,
    },
    packageDuration: {
        fontSize: 15,
        color: '#868E96',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    featuresContainer: {
        marginBottom: 18,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 7,
    },
    featureIcon: {
        marginRight: 10,
    },
    featureText: {
        fontSize: 15,
        color: '#495057',
        fontWeight: '500',
    },
    selectButton: {
        backgroundColor: '#6C63FF',
        paddingVertical: 13,
        paddingHorizontal: 28,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 8,
    },
    selectButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    nextButton: {
        backgroundColor: '#BDBDBD',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 14,
        marginTop: 28,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 5,
        elevation: 2,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    noPackagesContainer: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 20,
    },
    noPackagesText: {
        fontSize: 19,
        color: '#888',
        textAlign: 'center',
        lineHeight: 28,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(44, 62, 80, 0.18)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 28,
        width: '92%',
        maxWidth: 340,
        alignSelf: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 12,
        paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#22223B',
        marginBottom: 18,
        textAlign: 'center',
    },
    modalDetailsContainer: {
        width: '100%',
        marginBottom: 15,
        borderBottomWidth: 0,
        paddingBottom: 0,
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    modalDetailLabel: {
        fontSize: 15,
        color: '#555',
        fontWeight: '500',
        textAlign: 'left',
    },
    modalDetailValue: {
        fontSize: 15,
        color: '#2C3E50',
        fontWeight: '700',
        textAlign: 'right',
    },
    modalPrice: {
        fontSize: 25,
        fontWeight: '900',
        color: '#6C63FF',
        marginBottom: 18,
        marginTop: 12,
        textAlign: 'center',
    },
    paymentMethodLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#34495E',
        marginBottom: 10,
        marginTop: 20,
        textAlign: 'left',
    },
    paymentMethodPickerWrapper: {
        borderWidth: 1,
        borderColor: '#D1D9E6',
        borderRadius: 10,
        backgroundColor: '#FDFDFD',
        marginBottom: 15,
        width: '100%',
        height: 65,
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    paymentMethodPicker: {
        height: Platform.OS === 'ios' ? 150 : 65,
        width: '100%',
        color: '#2C3E50',
        paddingLeft: 15,
        textAlign: 'left',
    },
    paymentMethodPickerItem: {
        fontSize: 16,
        height: 65,
        textAlign: 'left',
    },
    subscribeButton: {
        backgroundColor: '#48CAE4',
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#48CAE4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 18,
    },
    subscribeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cancelText: {
        fontSize: 13,
        color: '#888',
        marginTop: 15,
        marginBottom: 5,
        textAlign: 'left',
    },
    infoText: {
        fontSize: 11,
        color: '#777',
        textAlign: 'left',
        marginBottom: 3,
        lineHeight: 16,
    },
    termsText: {
        fontSize: 11,
        color: '#777',
        textAlign: 'left',
        lineHeight: 16,
    },
    linkText: {
        color: '#6C63FF',
        fontWeight: '700',
    },
    checkStatusButton: {
        backgroundColor: '#6C63FF',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 14,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 2,
    },
    checkStatusButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
    paymentStatusContainer: {
        backgroundColor: '#F0EFFF',
        borderWidth: 1,
        borderColor: '#E0E4F7',
        borderRadius: 14,
        padding: 18,
        marginTop: 20,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 2,
    },
    paymentStatusText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#6C63FF',
        textAlign: 'center',
        marginBottom: 12,
    },
});

export default MembershipPackageScreen; 