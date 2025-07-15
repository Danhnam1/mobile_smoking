import { register } from '../api/auth';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState('');
  const [genderItems, setGenderItems] = useState([
    { label: 'Nam', value: 'nam' },
    { label: 'Nữ', value: 'nữ' },
    { label: 'Khác', value: 'khác' },
  ]);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword || !fullName || !birthDate || !gender) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    // Kiểm tra định dạng ngày sinh DD/MM/YYYY
    const dateRegex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dateRegex.test(birthDate)) {
      Alert.alert('Lỗi', 'Ngày sinh phải theo định dạng DD/MM/YYYY');
      return;
    }
    // Chuyển sang yyyy-mm-dd
    const [day, month, year] = birthDate.split('/');
    const birthDateForApi = `${year}-${month}-${day}T00:00:00.000+00:00`;
    console.log(birthDateForApi);
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      console.log('Calling register API...');
      await register({
        username,
        email,
        password,
        full_name: fullName,
        birth_date: birthDateForApi, // format YYYY-MM-DD
        gender,
      });
      Alert.alert(
        'Thành công',
        'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
        [
          {
            text: 'Đăng nhập',
            onPress: () => navigation.replace('LoginScreen')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Đăng ký thất bại', error.message);
      console.log(error);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setBirthDate(selectedDate.toISOString().split('T')[0]);
  };

  // Hàm format ngày sinh tự động
  const handleBirthDateChange = (text) => {
    // Chỉ lấy số
    let cleaned = text.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else if (cleaned.length <= 4) {
      formatted = `${cleaned.slice(0,2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length <= 8) {
      formatted = `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4,8)}`;
    } else {
      formatted = `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4,8)}`;
    }
    setBirthDate(formatted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Ngày sinh (DD/MM/YYYY)"
        value={birthDate}
        onChangeText={handleBirthDateChange}
        keyboardType="numeric"
        maxLength={10}
      />
      <DropDownPicker
        open={open}
        value={gender}
        items={genderItems}
        setOpen={setOpen}
        setValue={setGender}
        setItems={setGenderItems}
        placeholder="Chọn giới tính..."
        style={styles.input}
        dropDownContainerStyle={{
          borderColor: '#e0e0e0',
          borderRadius: 8,
        }}
        textStyle={{ color: '#222', fontSize: 16 }}
        placeholderStyle={{ color: '#888' }}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.replace('LoginScreen')}>
        <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#222',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  pickerInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  pickerContainer: {
    width: '100%',
    
  },
  button: {
    width: '100%',
    backgroundColor: '#4ECB71',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 16,
  },
  linkText: {
    color: '#4ECB71',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});

export default RegisterScreen;
