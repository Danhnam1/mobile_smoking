import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './src/screens/Home';
import TrackProgress from './src/screens/TrackProgress';
import { MaterialCommunityIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import Community from './src/screens/Community';
import WelcomeScreen from './src/screens/WelcomScreen';
import { createStackNavigator } from '@react-navigation/stack';
import SmokingStatus from './src/screens/SmokingStatus';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import UserDetailScreen from './src/screens/UserDetailScreen';
import ProgressSummary from './src/screens/ProgressSummary';
import MembershipPackageScreen from './src/screens/MembershipPackageScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import QuitPlanScreen from './src/screens/QuitPlanScreen';
import AllBadgesScreen from './src/screens/AllBadgesScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import QuitStage from './src/screens/QuitStage';
import { AiOutlineSchedule } from 'react-icons/ai';
import './src/config/firebase';
import CheckoutScreen from './src/screens/CheckoutScreen';
import PayPalWebViewScreen from './src/screens/PayPalWebViewScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import NotificationTab from './src/screens/NotificationTab';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: styles.bottomNav,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = 'home';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'TrackProgressTab') {
            iconName = 'progress-check';
            return <AiOutlineSchedule name={iconName} size={size} color={color} />;
          } else if (route.name === 'QuitStage') {
            return <MaterialCommunityIcons name="calendar-clock-outline" size={size} color={color} />;
          } else if (route.name === 'CommunityTab') {
            iconName = 'people-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'NotificationTab') {
            iconName = 'notifications-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } 
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={Home} options={{ title: 'Home' }} />
      <Tab.Screen name="QuitStage" component={QuitStage} options={{ title: 'Quit Stage' }} />
      <Tab.Screen name="CommunityTab" component={Community} options={{ title: 'Community' }} />
      <Tab.Screen name="NotificationTab" component={NotificationTab} options={{ title: 'Notification' }} />

      {/* <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} /> */}
    </Tab.Navigator>
  );
}

function Navigation() {
  const { user, loading, isProfileComplete, membershipStatus } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Determine the initial route name based on authentication and profile status
  let initialRouteName = "Welcome"; // Default for not logged in

  if (user) {
    initialRouteName = "Main"; // Luôn vào Home tab sau khi đăng nhập
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      {/* Auth Screens */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />

      {/* Main App Screens & Setup/Profile Edit Screens (always accessible once logged in) */}
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="UserDetailScreen" component={UserDetailScreen} />
      <Stack.Screen name="SmokingStatus" component={SmokingStatus} />
      <Stack.Screen name="ProgressSummary" component={ProgressSummary} />
      <Stack.Screen name="MembershipPackage" component={MembershipPackageScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="QuitPlanScreen" component={QuitPlanScreen} />
      <Stack.Screen name="QuitStage" component={QuitStage} />
      <Stack.Screen name="AllBadges" component={AllBadgesScreen} />
      <Stack.Screen name="QuitPlanDetailScreen" component={require('./src/screens/QuitPlanDetailScreen').default} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="PayPalWebView" component={PayPalWebViewScreen} />
      <Stack.Screen name="TransactionsScreen" component={TransactionsScreen} />

    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    height: 70,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopWidth: 0,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
