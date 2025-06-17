import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser, fetchSmokingStatus } from '../api'; // Import fetchSmokingStatus API

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState(null);

  // Load user data from storage when app starts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        
        if (storedUser && storedToken) {
          let userData = JSON.parse(storedUser);
          
          // Fetch smoking status data and merge it
          if (userData._id && storedToken) {
            try {
              const smokingStatus = await fetchSmokingStatus(storedToken);
              console.log('Fetched smoking status on app start:', smokingStatus);
              if (smokingStatus) {
                const latestSmokingData = smokingStatus; // Assuming smokingStatus itself is the latest record

                const moneySavedPerDay = (Number(latestSmokingData.price_per_pack) * Number(latestSmokingData.packs_per_week)) / 7;
                const calculatedMoneySaved = moneySavedPerDay * 30; // Calculate for 30 days
                const calculatedCigarettesAvoided = Number(latestSmokingData.cigarette_count) * 30;

                userData = {
                  ...userData,
                  cigarettesAvoided: calculatedCigarettesAvoided,
                  moneySaved: calculatedMoneySaved,
                  smokingData: {
                    cigaretteCount: latestSmokingData.cigarette_count,
                    suctionFrequency: latestSmokingData.suction_frequency,
                    pricePerPack: latestSmokingData.price_per_pack,
                    packsPerWeek: latestSmokingData.packs_per_week,
                    healthNote: latestSmokingData.health_note,
                    lastUpdated: latestSmokingData.record_date // Using record_date as lastUpdated
                  }
                };
                // Update AsyncStorage with the merged user data
                await AsyncStorage.setItem('user', JSON.stringify(userData));
              }
            } catch (smokingError) {
              console.warn('Could not fetch smoking status:', smokingError.message);
              // Continue loading user data even if smoking status fails
            }
          }

          setUser(userData);
          setToken(storedToken);
          setIsProfileComplete(userData.isProfileComplete || false);
          setMembershipStatus(userData.membership || null);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Save user data to storage and context
  const saveUserData = async (userData, userToken) => {
    try {
      // Fetch smoking status data and merge it *after* setting initial user data
      if (userData._id && userToken) {
        try {
          const smokingStatus = await fetchSmokingStatus(userToken);
          console.log('Fetched smoking status after login:', smokingStatus);
          if (smokingStatus) {
            const latestSmokingData = smokingStatus;

            const moneySavedPerDay = (Number(latestSmokingData.price_per_pack) * Number(latestSmokingData.packs_per_week)) / 7;
            const calculatedMoneySaved = moneySavedPerDay * 30;
            const calculatedCigarettesAvoided = Number(latestSmokingData.cigarette_count) * 30;

            userData = {
              ...userData,
              cigarettesAvoided: calculatedCigarettesAvoided,
              moneySaved: calculatedMoneySaved,
              smokingData: {
                cigaretteCount: latestSmokingData.cigarette_count,
                suctionFrequency: latestSmokingData.suction_frequency,
                pricePerPack: latestSmokingData.price_per_pack,
                packsPerWeek: latestSmokingData.packs_per_week,
                healthNote: latestSmokingData.health_note,
                lastUpdated: latestSmokingData.record_date
              }
            };
          }
        } catch (smokingError) {
          console.warn('Could not fetch smoking status after login:', smokingError.message);
        }
      }

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', userToken);
      setUser(userData);
      setToken(userToken);
      setMembershipStatus(userData.membership || null);
      if (userData.isProfileComplete) {
        setIsProfileComplete(true);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  };

  // Update user profile in context, storage and backend
  const updateUserProfile = async (updatedData) => {
    try {
      if (!user || !token) {
        throw new Error('User or token not available for profile update.');
      }

      // Send only direct user profile fields to the main updateUser endpoint
      const userProfileUpdates = {};
      if (updatedData.fullName) userProfileUpdates.full_name = updatedData.fullName;
      if (updatedData.dateOfBirth) userProfileUpdates.birth_date = updatedData.dateOfBirth;
      if (updatedData.gender) userProfileUpdates.gender = updatedData.gender;
      if (typeof updatedData.isProfileComplete !== 'undefined') userProfileUpdates.isProfileComplete = updatedData.isProfileComplete;

      // Update backend only for fields directly on the user model
      if (Object.keys(userProfileUpdates).length > 0) {
        await updateUser(userProfileUpdates, token);
      }

      // Local state and AsyncStorage update (including smokingData if present in updatedData)
      const newUserData = { ...user, ...updatedData };
      await AsyncStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);

      if (typeof updatedData.isProfileComplete !== 'undefined') {
        setIsProfileComplete(updatedData.isProfileComplete);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Update membership status in context and storage
  const updateMembershipStatus = async (membershipData) => {
    try {
      const newUserData = { ...user, membership: membershipData };
      await AsyncStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
      setMembershipStatus(membershipData);
    } catch (error) {
      console.error('Error updating membership status:', error);
      throw error;
    }
  };

  // Logout: Clear storage and context
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setIsProfileComplete(false);
      setMembershipStatus(null);
    } catch (error) {
      console.error('Error during logout:', error);
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