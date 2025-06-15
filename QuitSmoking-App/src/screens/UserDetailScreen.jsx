import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Helper function to format ISO date string to DD/MM/YYYY
const formatDateToDDMMYYYY = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to parse DD/MM/YYYY string to ISO date string
const parseDDMMYYYYToISO = (ddmmyyyyString) => {
  if (!ddmmyyyyString) return '';
  const parts = ddmmyyyyString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    const date = new Date(Date.UTC(year, month, day)); // Use UTC to avoid timezone issues
    return date.toISOString();
  }
  return ''; // Return empty string if invalid format
};

const UserDetailScreen = ({ navigation, route }) => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    dateOfBirth: formatDateToDDMMYYYY(user?.birth_date) || '',
    gender: user?.gender || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields (adjusted for removed phone)
      if (!formData.fullName || !formData.email) { // Adjusted validation
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      // Prepare data for API call, only including fields backend expects
      const dataToSend = {
        fullName: formData.fullName,
        dateOfBirth: parseDDMMYYYYToISO(formData.dateOfBirth),
        gender: formData.gender,
      };

      // Update user profile in context and storage
      await updateUserProfile(dataToSend);

      Alert.alert(
        'Thành công',
        'Thông tin cá nhân đã được cập nhật',
        [
          {
            text: 'OK',
            onPress: () => {
              // Check if navigation came from ProfileScreen
              if (route.params?.fromProfileEdit) {
                navigation.goBack(); // Go back to ProfileScreen
              } else {
                navigation.navigate('SmokingStatus'); // Continue to SmokingStatus for initial setup
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin cá nhân');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            placeholder="Nhập họ và tên"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Nhập email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ngày sinh</Text>
          <TextInput
            style={styles.input}
            value={formData.dateOfBirth}
            onChangeText={(value) => handleInputChange('dateOfBirth', value)}
            placeholder="DD/MM/YYYY"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Giới tính</Text>
          <TextInput
            style={styles.input}
            value={formData.gender}
            onChangeText={(value) => handleInputChange('gender', value)}
            placeholder="Nhập giới tính"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Lưu thông tin</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserDetailScreen; 