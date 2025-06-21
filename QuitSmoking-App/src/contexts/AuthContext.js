import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser, fetchSmokingStatus, getCurrentUserMembership } from '../api/user'; // Import fetchSmokingStatus API and getCurrentUserMembership API

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState(null);

  // Function to sync membership status from the server
  const syncMembershipStatus = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        console.log('Syncing membership status from server...');
        const membership = await getCurrentUserMembership(storedToken);
        setMembershipStatus(membership); // This can be null if no membership
        console.log('Membership status synced:', membership);
      }
    } catch (error) {
      console.error('Failed to sync membership status:', error.message);
      // Don't block the app, just log the error.
      // Maybe set status to an error state if needed.
    }
  }, []);

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

          // Fetch fresh membership status from server
          await syncMembershipStatus();
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [syncMembershipStatus]);

  // Save user data to storage and context
  const saveUserData = useCallback(async (userData, userToken) => {
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
      setIsProfileComplete(userData.isProfileComplete || false);
      
      // After saving user data (login/register), sync their membership
      await syncMembershipStatus();

    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }, [syncMembershipStatus]);

  // Update user profile in context, storage and backend
  const updateUserProfile = useCallback(async (updatedData) => {
    try {
      if (!user || !token) {
        throw new Error('User or token not available for profile update.');
      }

      console.log('updateUserProfile called with data:', updatedData);

      // Prepare the data payload for the backend API
      const userProfileUpdates = {};
      if (updatedData.fullName) userProfileUpdates.full_name = updatedData.fullName;
      if (updatedData.dateOfBirth) userProfileUpdates.birth_date = updatedData.dateOfBirth;
      if (updatedData.gender) userProfileUpdates.gender = updatedData.gender;
      if (typeof updatedData.isProfileComplete !== 'undefined') userProfileUpdates.isProfileComplete = updatedData.isProfileComplete;

      console.log('User profile updates to send to backend:', userProfileUpdates);

      let updatedUserFromApi;
      // Update backend only if there are fields to update
      if (Object.keys(userProfileUpdates).length > 0) {
        console.log('Calling updateUser API...');
        // The API returns the updated user object, we capture it here
        updatedUserFromApi = await updateUser(userProfileUpdates, token);
        console.log('updateUser API call successful, received:', updatedUserFromApi);
      } else {
        console.log('No user profile fields to update on backend');
      }

      // Merge the new data from the API with the existing local state
      // The data from the API is the source of truth for the updated fields
      const newUserData = { ...user, ...updatedData, ...updatedUserFromApi };
      console.log('Updating local user data with merged data:', newUserData);
      
      await AsyncStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData); // This will re-render components using the user context

      if (typeof updatedData.isProfileComplete !== 'undefined') {
        setIsProfileComplete(updatedData.isProfileComplete);
      }

      console.log('updateUserProfile completed successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error; // Re-throw the error to be caught by the calling component
    }
  }, [user, token]);

  // Update membership status in context and storage
  const updateMembershipStatus = useCallback(async (membershipData) => {
    try {
      // Directly update the state from the payment capture response
      setMembershipStatus(membershipData);

      // We can also re-sync with the server to be absolutely sure
      // await syncMembershipStatus();
    } catch (error) {
      console.error('Error updating membership status:', error);
      throw error;
    }
  }, []); // Removed syncMembershipStatus from deps to avoid loops

  // Logout: Clear storage and context
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'token']);
      setUser(null);
      setToken(null);
      setIsProfileComplete(false);
      setMembershipStatus(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }, []);

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
        syncMembershipStatus, // Expose the sync function
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