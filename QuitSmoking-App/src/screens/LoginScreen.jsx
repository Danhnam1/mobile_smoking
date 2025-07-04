import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { login, loginWithGoogle } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';



const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { saveUserData } = useAuth();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '894694850190-r6vosftketmngbivqk7c7321ubdvsk0j.apps.googleusercontent.com',
    });
  }, []);

  
async function onGoogleButtonPress() {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const signInResult = await GoogleSignin.signIn();
    let idToken = signInResult.idToken || signInResult.data?.idToken;
    if (!idToken) throw new Error('No ID token found');

    // Gửi idToken lên backend
    const res = await loginWithGoogle(idToken);

    // Lưu user và token vào context (nếu có)
    await saveUserData(res.user, res.token);

    // Điều hướng vào app
    navigation.navigate('Main');
  } catch (error) {
    Alert.alert('Đăng nhập Google thất bại', error.message);
  }
}
  const handleLogin = async () => {
    console.log('Attempting to log in...', { email, password });
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      console.log('Calling login API...');
      const res = await login(email, password);
      console.log('Login API response:', res);
      
      // Save user data to AuthContext
      await saveUserData(res.user, res.token);
      console.log('User data saved to AuthContext.');

      // Navigate to the main application stack
      navigation.navigate('Main');

    } catch (error) {
      console.error('Login failed in handleLogin:', error);
      Alert.alert('Đăng nhập thất bại', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
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
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onGoogleButtonPress}>
        <Text style={styles.buttonText}>Đăng nhập với Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('RegisterScreen')}>
        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('ForgotPasswordScreen')}>
        <Text style={styles.linkText}>Quên mật khẩu?</Text>
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

export default LoginScreen; 