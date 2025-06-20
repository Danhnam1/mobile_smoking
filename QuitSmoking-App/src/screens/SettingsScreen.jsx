import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const renderSettingItem = (icon, title, onPress, isDestructive = false) => (
    <TouchableOpacity 
      style={[styles.settingItem, isDestructive && styles.destructiveItem]} 
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <MaterialCommunityIcons 
          name={icon} 
          size={24} 
          color={isDestructive ? '#FF3B30' : '#4ECB71'} 
          style={styles.settingIcon} 
        />
        <Text style={[styles.settingText, isDestructive && styles.destructiveText]}>
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#888" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back-outline" size={28} color="#2C3E50" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>
          <Text style={styles.title}>Cài đặt</Text>
        </View>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          {renderSettingItem('account-outline', 'Thông tin cá nhân', () => navigation.navigate('ProfileScreen'))}
          {renderSettingItem('bell-outline', 'Thông báo', () => {})}
          
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ứng dụng</Text>
          {renderSettingItem('information-outline', 'Giới thiệu', () => {})}
          {renderSettingItem('help-circle-outline', 'Trợ giúp', () => {})}
          {renderSettingItem('file-document-outline', 'Điều khoản sử dụng', () => {})}
          {renderSettingItem('shield-check-outline', 'Chính sách bảo mật', () => {})}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khác</Text>
          {renderSettingItem('logout', 'Đăng xuất', handleLogout, true)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  headerRightSpacer: {
    width: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  destructiveItem: {
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  destructiveText: {
    color: '#FF3B30',
  },
});

export default SettingsScreen; 