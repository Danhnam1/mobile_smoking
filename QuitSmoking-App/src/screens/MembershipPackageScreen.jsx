import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Platform, Dimensions, Linking } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { getMembershipPackages, createPayment, createPayPalOrder, capturePayPalOrder, getPayPalPaymentStatus } from '../api';
import { Picker } from '@react-native-picker/picker';
import { WebView } from 'react-native-webview';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

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
        }
    }, [user, token, fetchPackages]);

    // useFocusEffect to check payment status when the screen is focused
    useFocusEffect(
        useCallback(() => {
            if (currentPayPalOrderId && userToken && userId) {
                console.log('Screen focused with pending PayPal order, checking status...');
                handleCheckPaymentStatus();
            }
        }, [currentPayPalOrderId, userToken, userId])
    );

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

            Linking.openURL(response.approveUrl);
            Alert.alert('Chuyển hướng', 'Bạn sẽ được chuyển hướng đến PayPal để hoàn tất thanh toán. Vui lòng quay lại ứng dụng để kiểm tra trạng thái.');

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
            Alert.alert('Lỗi', 'Không có đơn hàng PayPal nào để kiểm tra.');
            return;
        }

        Alert.alert('Kiểm tra trạng thái', 'Đang kiểm tra trạng thái thanh toán...', [{ text: 'OK' }]);

        try {
            const statusResponse = await getPayPalPaymentStatus(currentPayPalOrderId, userToken);
            if (statusResponse && statusResponse.status) {
                Alert.alert(
                    'Trạng thái thanh toán',
                    `Trạng thái đơn hàng của bạn: ${statusResponse.status.toUpperCase()}`,
                    [
                        { text: 'OK', onPress: () => {
                            if (statusResponse.status === 'success') {
                                Alert.alert('Thành công', 'Thanh toán đã hoàn tất!');
                                navigation.navigate('Main', { screen: 'HomeTab' });
                            } else if (statusResponse.status === 'pending') {
                                Alert.alert('Đang chờ', 'Thanh toán đang chờ xử lý. Vui lòng kiểm tra lại sau.');
                            } else {
                                Alert.alert('Thất bại', 'Thanh toán thất bại hoặc đã bị hủy.');
                            }
                            setCurrentPayPalOrderId(null);
                        }}
                    ]
                );
            } else {
                Alert.alert('Lỗi', 'Không nhận được trạng thái thanh toán.');
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            Alert.alert('Lỗi', error.message || 'Không thể kiểm tra trạng thái thanh toán!');
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
                <Text style={styles.nextButtonText}>Tiếp theo (Dành cho người bỏ qua)</Text>
            </TouchableOpacity>

            {currentPayPalOrderId && (
                <TouchableOpacity 
                    style={styles.checkStatusButton}
                    onPress={handleCheckPaymentStatus}
                >
                    <Text style={styles.checkStatusButtonText}>Kiểm tra trạng thái thanh toán</Text>
                </TouchableOpacity>
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
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: '#F7F9FC',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 17,
        color: '#555',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 17,
        color: '#D9534F',
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '500',
    },
    retryButton: {
        backgroundColor: '#5CB85C',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 17,
        color: '#7F8C8D',
        textAlign: 'center',
        marginBottom: 35,
        lineHeight: 25,
    },
    packageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    proPackageCard: {
        borderColor: '#FFD700',
        borderWidth: 3,
        shadowColor: '#FFD700',
        shadowOpacity: 0.2,
        elevation: 10,
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    packageName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#212529',
    },
    proPackageName: {
        color: '#FFD700',
    },
    packageDescription: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 22,
    },
    packagePrice: {
        fontSize: 24,
        fontWeight: '800',
        color: '#228BE6',
    },
    packageDuration: {
        fontSize: 16,
        color: '#868E96',
        marginBottom: 12,
    },
    featuresContainer: {
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureIcon: {
        marginRight: 8,
        color: '#40C057',
    },
    featureText: {
        fontSize: 15,
        color: '#495057',
    },
    selectButton: {
        backgroundColor: '#228BE6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#228BE6',
        shadowOffset: { 
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    selectButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        backgroundColor: '#BDC3C7',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginTop: 25,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    nextButtonText: {
        color: '#555',
        fontSize: 17,
        fontWeight: '600',
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        width: '90%',
        maxWidth: 320,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 20,
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
        fontWeight: '600',
        textAlign: 'right',
    },
    modalPrice: {
        fontSize: 24,
        fontWeight: '800',
        color: '#4ECB71',
        marginBottom: 20,
        marginTop: 15,
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
        borderRadius: 8,
        backgroundColor: '#FDFDFD',
        marginBottom: 15,
        width: '100%',
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
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
        backgroundColor: '#4ECB71',
        paddingVertical: 14,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#4ECB71',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 15,
    },
    subscribeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
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
        color: '#3498DB',
        fontWeight: '600',
    },
    checkStatusButton: {
        backgroundColor: '#5CB85C',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    checkStatusButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6C757D',
        lineHeight: 22,
    },
    packageContainer: {
        padding: 16,
    },
    proPackageCard: {
        borderColor: '#FFD700',
        borderWidth: 3,
        shadowColor: '#FFD700',
        shadowOpacity: 0.2,
        elevation: 10,
    },
    featuresContainer: {
        marginBottom: 20,
    },
    webViewOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        zIndex: 1000,
    },
    webView: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1001,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 8,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FFFFFF',
    },
    successIcon: {
        fontSize: 80,
        color: '#40C057',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 16,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        color: '#495057',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    successButton: {
        backgroundColor: '#228BE6',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        shadowColor: '#228BE6',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    successButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MembershipPackageScreen; 