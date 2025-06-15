import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser } from '../api'; // Import updateUser API

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState(null);

  // To force login every time, we will not load user data from storage.
  // Instead, we immediately set loading to false and ensure no user data is present initially.
  useEffect(() => {
    setLoading(false); // Immediately set loading to false
  }, []);

  const loadUserData = async () => {
    // We are no longer loading from AsyncStorage to force login every time
    // Forcing initial state to be unauthenticated
    setUser(null);
    setToken(null);
    setIsProfileComplete(false);
    setMembershipStatus(null);
    setLoading(false);
  };

  // Save user data to context only, not to storage
  const saveUserData = async (userData, userToken) => {
    try {
      // await AsyncStorage.setItem('user', JSON.stringify(userData)); // Removed saving to storage
      // await AsyncStorage.setItem('token', userToken); // Removed saving to storage
      setUser(userData);
      setToken(userToken);
      setMembershipStatus(userData.membership || null);
      // After successful login, if user data is complete, set profile complete flag
      if (userData.isProfileComplete) {
          setIsProfileComplete(true);
      }
    } catch (error) {
      console.error('Error saving user data (in-memory only):', error);
      throw error;
    }
  };

  // Update user profile in context and storage
  const updateUserProfile = async (updatedData) => {
    try {
      if (!user || !token) {
        throw new Error('User or token not available for profile update.');
      }

      // Prepare data for backend (convert to snake_case if necessary for backend expectations)
      const dataToSend = {
        full_name: updatedData.fullName, // Map fullName to full_name
        birth_date: updatedData.dateOfBirth, // Map dateOfBirth to birth_date
        gender: updatedData.gender, // Map gender to gender
        // Only include fields that the backend's updateCurrentUser expects
      };

      // Send update to the backend
      const response = await updateUser(dataToSend, token);

      // Update local state with the response from the backend or the merged data
      const newUserData = { ...user, ...updatedData };
      setUser(newUserData);
      // Explicitly update isProfileComplete if it's in updatedData
      if (typeof updatedData.isProfileComplete !== 'undefined') {
        setIsProfileComplete(updatedData.isProfileComplete);
      }
    } catch (error) {
      console.error('Error updating user profile:', error); // Changed log message
      throw error;
    }
  };

  // Update membership status in context only, not to storage
  const updateMembershipStatus = async (membershipData) => {
    try {
      const newUserData = { ...user, membership: membershipData };
      // await AsyncStorage.setItem('user', JSON.stringify(newUserData)); // Removed saving to storage
      setUser(newUserData);
      setMembershipStatus(membershipData);
    } catch (error) {
      console.error('Error updating membership status (in-memory only):', error);
      throw error;
    }
  };

  // Logout: Clear in-memory state
  const logout = async () => {
    try {
      // await AsyncStorage.removeItem('user'); // Removed removing from storage
      // await AsyncStorage.removeItem('token'); // Removed removing from storage
      setUser(null);
      setToken(null);
      setIsProfileComplete(false);
      setMembershipStatus(null);
    } catch (error) {
      console.error('Error during logout (in-memory only):', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isProfileComplete,
        membershipStatus,
        saveUserData,
        updateUserProfile,
        updateMembershipStatus,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 