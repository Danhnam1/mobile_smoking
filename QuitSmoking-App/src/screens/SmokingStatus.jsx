import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createSmokingStatusInitial } from '../api/user';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const SmokingStatus = ({ navigation, route }) => {
    const [cigaretteCount, setCigaretteCount] = useState('');
    const [suctionFrequency, setSuctionFrequency] = useState('medium');
    const [healthNote, setHealthNote] = useState('');
    const [pricePerPack, setPricePerPack] = useState('');
    const [packsPerWeek, setPacksPerWeek] = useState('');

    const { user, token, updateUserProfile } = useAuth();

    // Add console.log to inspect user and token when component mounts or re-renders
    React.useEffect(() => {
        console.log('SmokingStatus: User object from AuthContext', user);
        console.log('SmokingStatus: Token from AuthContext', token);
    }, [user, token]);

    const handleSubmit = async () => {
        console.log('handleSubmit: User object at submission', user);
        console.log('handleSubmit: Token at submission', token);

        if (!user || !token) {
            Alert.alert('Lỗi', 'Không tìm thấy ID người dùng hoặc token. Vui lòng đăng nhập lại.');
            return;
        }

        const userId = user._id;

        const moneySavedPerDay = (Number(pricePerPack) * Number(packsPerWeek)) / 7;
        const moneySaved = moneySavedPerDay * 30; // Calculate for 30 days

        try {
            await createSmokingStatusInitial({
                user_id: userId,
                record_date: new Date().toISOString(),
                cigarette_count: Number(cigaretteCount),
                time_of_smoking: new Date().toISOString(),
                money_spent: moneySavedPerDay,
                suction_frequency: suctionFrequency,
                health_note: healthNote,
                price_per_pack: Number(pricePerPack),
                packs_per_week: Number(packsPerWeek),
            }, token);

            const cigarettesAvoided = Number(cigaretteCount) * 30;
            
            await updateUserProfile({ 
                cigarettesAvoided, 
                moneySaved,
                smokingData: {
                    cigaretteCount: Number(cigaretteCount),
                    suctionFrequency,
                    pricePerPack: Number(pricePerPack),
                    packsPerWeek: Number(packsPerWeek),
                    healthNote,
                    lastUpdated: new Date().toISOString()
                }
                // We will set isProfileComplete to true in ProgressSummary to ensure the flow
                // isProfileComplete: true 
            });

            // Navigate to ProgressSummary, passing the calculated values
            navigation.navigate('ProgressSummary', { cigarettesAvoided, moneySaved });

        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Tạo trạng thái hút thuốc thất bại!');
        }
    };

    return (
        <LinearGradient colors={["#e8fce8", "#fff"]} style={styles.gradientBg}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.topSection}>
                    <View style={styles.titleRow}>
                        <Text style={styles.setupTitle}>Thiết lập hồ sơ</Text>
                    </View>
                    <View style={styles.titleUnderline} />
                    <Text style={styles.stepText}>Bước 1/2</Text>
                    <View style={styles.progressBarBg}>
                        <View style={styles.progressBarFill} />
                    </View>
                </View>
                <View style={styles.container}>
                    <Text style={styles.header}>🚬 Thông tin hút thuốc</Text>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Số điếu thuốc hút mỗi ngày *</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="VD: 10"
                                keyboardType="numeric"
                                value={cigaretteCount}
                                onChangeText={setCigaretteCount}
                                placeholderTextColor="#B0B3B8"
                            />
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tần suất hút (light/medium/heavy)</Text>
                        <View style={styles.pickerFullWidth}>
                            <Picker
                                selectedValue={suctionFrequency}
                                style={styles.picker}
                                onValueChange={setSuctionFrequency}
                                dropdownIconColor="#27ae60"
                            >
                                <Picker.Item label="Nhẹ (light)" value="light" />
                                <Picker.Item label="Trung bình (medium)" value="medium" />
                                <Picker.Item label="Nặng (heavy)" value="heavy" />
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Giá 1 gói thuốc (VND)</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="VD: 25000"
                                keyboardType="numeric"
                                value={pricePerPack}
                                onChangeText={setPricePerPack}
                                placeholderTextColor="#B0B3B8"
                            />
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Số gói mỗi tuần</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="VD: 5"
                                keyboardType="numeric"
                                value={packsPerWeek}
                                onChangeText={setPacksPerWeek}
                                placeholderTextColor="#B0B3B8"
                            />
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Ghi chú sức khỏe</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, { height: 60 }]}
                                placeholder="Nhập ghi chú sức khỏe (tuỳ chọn)"
                                value={healthNote}
                                onChangeText={setHealthNote}
                                placeholderTextColor="#B0B3B8"
                                multiline
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
                        <LinearGradient colors={["#b9f6ca", "#43e97b"]} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>Tiếp theo</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                <Text style={styles.motivation}>Bạn đang thực hiện một quyết định tuyệt vời cho sức khỏe và tương lai của mình!</Text>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientBg: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 32,
    },
    topSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
    },
    setupTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#222',
        textAlign: 'center',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.04)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        marginBottom: 0,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    titleUnderline: {
        alignSelf: 'center',
        width: 60,
        height: 3,
        backgroundColor: '#4ECB71',
        borderRadius: 2,
        marginTop: 4,
        marginBottom: 8,
        opacity: 0.7,
    },
    stepText: {
        fontSize: 15,
        color: '#4ECB71',
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 2,
        letterSpacing: 0.2,
    },
    progressBarBg: {
        width: 260,
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 6,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBarFill: {
        width: '50%', // bước 1/2
        height: 6,
        backgroundColor: '#4ECB71',
        borderRadius: 6,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 28,
        marginHorizontal: 18,
        marginBottom: 18,
        shadowColor: '#333',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.10,
        shadowRadius: 24,
        elevation: 6,
        alignItems: 'stretch',
    },
    header: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 26,
        textAlign: 'center',
        color: '#27ae60',
        letterSpacing: 0.2,
    },
    formGroup: {
        marginBottom: 18,
    },
    label: {
        fontWeight: '600',
        marginBottom: 4,
        fontSize: 13,
        color: '#444',
        letterSpacing: 0.1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        paddingHorizontal: 12,
        marginTop: 2,
        shadowColor: '#43e97b',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        marginBottom: 2,
    },
    input: {
        flex: 1,
        height: Platform.OS === 'ios' ? 38 : 42,
        fontSize: 16,
        color: '#222',
        backgroundColor: 'transparent',
        borderWidth: 0,
        fontWeight: '500',
        letterSpacing: 0.1,
    },
    pickerFullWidth: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        marginTop: 4,
        marginBottom: 2,
        alignSelf: 'center',
        minWidth: 200,
    },
    picker: {
        height: 52,
        width: '100%',
        minWidth: 200,
        color: '#222',
        backgroundColor: 'transparent',
    },
    button: {
        borderRadius: 24,
        marginTop: 22,
        overflow: 'hidden',
        elevation: 3,
        alignSelf: 'center',
        width: '100%',
    },
    buttonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 24,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 18,
        letterSpacing: 0.2,
    },
    motivation: {
        marginTop: 10,
        color: '#A0A4AA',
        textAlign: 'center',
        fontSize: 13,
        marginHorizontal: 32,
        fontStyle: 'italic',
        fontWeight: '400',
    },
});

export default SmokingStatus;
