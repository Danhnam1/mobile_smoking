import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const WelcomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <View style={styles.illustrationWrapper}>
      <Image
        source={require('../../assets/splash-icon.png')}
        style={styles.illustration}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.title}>Welcome to QuitNow</Text>
    <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('LoginScreen')}>
      <Text style={styles.startButtonText}>Login</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate('RegisterScreen')}>
      <Text style={styles.signInButtonText}>Register</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: 220,
    height: 160,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#111',
    textAlign: 'center',
  },
  startButton: {
    width: '100%',
    backgroundColor: '#4ECB71',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  signInButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4ECB71',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#4ECB71',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default WelcomeScreen;