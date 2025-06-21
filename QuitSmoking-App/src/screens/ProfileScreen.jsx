import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const formatMoney = (value) => {
  if (value === undefined || value === null) return 'Chưa cập nhật';
  const numericValue = Math.round(Number(value));
  return numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const ProfileScreen = ({ navigation }) => {
  const { user, membershipStatus } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Đang tải thông tin người dùng...</Text>
      </SafeAreaView>
    );
  }

  // Default values if data is not yet set in user profile
  const cigarettesAvoided = user.cigarettesAvoided || 0;
  const moneySaved = user.moneySaved || 0;

  // Helper to format date for display
  const formattedBirthDate = user.birth_date ? new Date(user.birth_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa cập nhật';

  const renderInfoRow = (iconType, iconName, label, value) => (
    <View style={styles.infoRow}>
      {iconType === 'Ionicons' ? (
        <Ionicons name={iconName} size={22} color="#4ECB71" style={styles.infoIcon} />
      ) : (
        <MaterialCommunityIcons name={iconName} size={22} color="#4ECB71" style={styles.infoIcon} />
      )}
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })} style={styles.backButtonContainer}>
            <Ionicons name="arrow-back-outline" size={28} color="#2C3E50" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.title}>Hồ sơ của tôi</Text>
          </View>
          <View style={styles.headerRightSpacer} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderWithEdit}>
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UserDetailScreen', { fromProfileEdit: true })}>
              <MaterialCommunityIcons name="pencil-outline" size={22} color="green" />
            </TouchableOpacity>
          </View>
          {renderInfoRow('Ionicons', 'person-outline', 'Họ và tên', user.full_name || 'Chưa cập nhật')}
          {renderInfoRow('Ionicons', 'mail-outline', 'Email', user.email || 'Chưa cập nhật')}
          {renderInfoRow('Ionicons', 'calendar-outline', 'Ngày sinh', formattedBirthDate)}
          {renderInfoRow('MaterialCommunityIcons', 'gender-male-female', 'Giới tính', user.gender || 'Chưa cập nhật')}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderWithEdit}>
            <Text style={styles.cardTitle}>SmokingStatus</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SmokingStatus')}>
              <MaterialCommunityIcons name="pencil-outline" size={22} color="green" />
            </TouchableOpacity>
          </View>
          {renderInfoRow('MaterialCommunityIcons', 'smoke', 'Số điếu thuốc tránh được', `${cigarettesAvoided} điếu`)}
          {renderInfoRow('MaterialCommunityIcons', 'cash-multiple', 'Tiền tiết kiệm được', `${formatMoney(moneySaved)} VNĐ`)}
          {renderInfoRow('MaterialCommunityIcons', 'numeric', 'Số điếu mỗi ngày trước đây', user.smokingData?.cigaretteCount ? `${user.smokingData.cigaretteCount} điếu` : 'Chưa cập nhật')}
          {renderInfoRow('MaterialCommunityIcons', 'currency-usd', 'Giá 1 bao thuốc trước đây', user.smokingData?.pricePerPack ? `${formatMoney(user.smokingData.pricePerPack)} VNĐ` : 'Chưa cập nhật')}
          {renderInfoRow('MaterialCommunityIcons', 'package-variant', 'Số gói mỗi tuần', user.smokingData?.packsPerWeek ? `${user.smokingData.packsPerWeek} gói` : 'Chưa cập nhật')}
          {renderInfoRow('MaterialCommunityIcons', 'speedometer', 'Tần suất hút', user.smokingData?.suctionFrequency ? 
            user.smokingData.suctionFrequency === 'light' ? 'Nhẹ' :
            user.smokingData.suctionFrequency === 'medium' ? 'Trung bình' : 'Nặng'
            : 'Chưa cập nhật')}
          {user.smokingData?.healthNote && renderInfoRow('MaterialCommunityIcons', 'note-text-outline', 'Ghi chú sức khỏe', user.smokingData.healthNote)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gói thành viên</Text>
          {membershipStatus && membershipStatus.status === 'active' ? (
            <>
              {renderInfoRow(
                'Ionicons',
                'star',
                'Trạng thái gói',
                membershipStatus.package_name ? membershipStatus.package_name.toUpperCase() : 'Pro'
              )}
              {renderInfoRow(
                'MaterialCommunityIcons',
                'calendar-check',
                'Ngày hết hạn',
                new Date(membershipStatus.expire_date).toLocaleDateString('vi-VN')
              )}
            </>
          ) : (
            renderInfoRow('Ionicons', 'star-outline', 'Trạng thái gói', 'Chưa có gói')
          )}
          
          <TouchableOpacity 
            style={styles.membershipButton} 
            onPress={() => navigation.navigate('MembershipPackage')}
          >
            <Text style={styles.membershipButtonText}>
              {membershipStatus && membershipStatus.status === 'active' ? 'Quản lý gói' : 'Xem/Nâng cấp gói'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.historyButton} 
            onPress={() => navigation.navigate('TransactionsScreen')}
          >
            <Text style={styles.historyButtonText}>Lịch sử giao dịch</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    textAlign:'center',
    fontSize: 28,
    marginLeft:'30',
    fontWeight: '800',
    color: '#2C3E50',
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    color: '#555',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34495E',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoIcon: {
    color:'green',
    marginRight: 10,
    width: 24,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  membershipButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#228BE6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  historyButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'green',
  },
  historyButtonText: {
    color: 'green',
    fontSize: 16,
    fontWeight: '600',
  },
  membershipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardHeaderWithEdit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonContainer: {
    padding: 10,
    marginRight: 10,
    zIndex: 1,
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  headerRightSpacer: {
    width: 48,
  },
});

export default ProfileScreen;
