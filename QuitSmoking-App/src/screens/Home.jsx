import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Button } from 'react-native';
import { AntDesign, FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useEffect, useState, useCallback } from 'react';
import { getAllBadges } from '../api/badges';
import { getQuitPlanSummary, fetchQuitPlan } from '../api/quitPlan';
import { fetchUserProgress, fetchSmokingStatus } from '../api/user';
import { getProgressByStage, getTotalCigarettesInPeriod, getTotalMoneySpentInPeriod } from '../api/progressTracking';
import AppHeader from '../components/AppHeader';
import HomeHeaderAndProgressCard from '../components/HomeHeaderAndProgressCard';
import HomeStatsSection from '../components/HomeStatsSection';
import HomeHealthImprovementSection from '../components/HomeHealthImprovementSection';
import HomeQuickActionsSection from '../components/HomeQuickActionsSection';
import { useAuth } from '../contexts/AuthContext';
import BadgeScreen from './BadgeScreen';

export default function Home() {
  const navigation = useNavigation();
  const [achievements, setAchievements] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [badgesError, setBadgesError] = useState(null);
  const [progressData, setProgressData] = useState({
    daysQuit: 0,
    cigarettesAvoided: 0,
    moneySaved: 0
  });

  const { user, token } = useAuth();

  const loadData = useCallback(async () => {
    try {
      // // Fetch achievements first (usually not dependent on login status)
      // const badgesData = await getAllBadges();
      // setAchievements(badgesData.badges);

      // Fetch progress data ONLY if user ID and token are available from AuthContext
      if (user && token) {
        // Lấy thông tin hút thuốc trước khi cai
        const preStatus = await fetchSmokingStatus(token);
        const avgCigPerDay = preStatus?.cigarette_count || 0;
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>dasd", user)
        // Fetch the user's quit plan to get planId
        const quitPlan = await fetchQuitPlan(user._id, token);
        console.log('quitPlan:', quitPlan);

        if (quitPlan) {
          const summary = await getQuitPlanSummary(quitPlan._id, token);
          console.log('Summary API response:', summary);
          const daysQuit = summary.progress_days || 0;
          const totalCigarettesSmoked = summary.total_cigarettes || 0;
          // Tính số thuốc đã tránh được
          let cigarettesAvoided = (daysQuit * avgCigPerDay) - totalCigarettesSmoked;
          if (cigarettesAvoided < 0) cigarettesAvoided = 0;
          setProgressData({
            daysQuit,
            cigarettesAvoided,
            moneySaved: summary.total_money_spent || 0
          });
        } else {
          setProgressData({
            daysQuit: 0,
            cigarettesAvoided: 0,
            moneySaved: 0
          });
        }
      } else {
        console.log('Skipping progress data fetch as user is not logged in or token is missing.');
        setProgressData({
          daysQuit: 0,
          cigarettesAvoided: 0,
          moneySaved: 0
        });
      }

      setLoadingBadges(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setBadgesError('Failed to load data (badges or progress). Please check your connection and login status.');
      setLoadingBadges(false);
    }
  }, [user, token]);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Helper functions to calculate progress metrics
  const calculateDaysQuit = (progressData) => {
    if (!progressData || !progressData.date) return 0;
    const quitDate = new Date(progressData.date);
    const today = new Date();
    const diffTime = Math.abs(today - quitDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateCigarettesAvoided = (progressData) => {
    if (!progressData || !progressData.cigarette_count) return 0;
    return progressData.cigarette_count;
  };

  const calculateMoneySaved = (smokingStatusData) => {
    if (!smokingStatusData || !smokingStatusData.money_spent) return 0;
    return smokingStatusData.money_spent.toFixed(2);
  };

  const handlePressQuitPlan = async () => {
    try {
      const plan = await fetchQuitPlan(user._id, token);
      if (plan) {
        navigation.navigate('QuitPlanDetailScreen', { planId: plan._id });
      } else {
        navigation.navigate('QuitPlanScreen');
      }
    } catch (error) {
      navigation.navigate('QuitPlanScreen');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Overall Progress Card */}
        <HomeHeaderAndProgressCard progressData={progressData} />

        {/* Community Section */}
        <TouchableOpacity style={styles.sectionContainer} onPress={() => navigation.navigate('CommunityTab')}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community</Text>
          </View>
          {/* Placeholder for Community content */}
          <View style={styles.card}>
            <View style={[styles.communityImage, styles.communityImagePlaceholder]}>
              <Ionicons name="people" size={30} color="#FFF" />
            </View>
            <View>
              <Text style={styles.communityUsername}>{user.full_name}</Text>
              <Text style={styles.communityMessage}>cố cán mốc 100 ngày đầu</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Achievements Section */}
        <BadgeScreen navigation={navigation} />

        {/* Health Improvements Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Coach</Text>
          </View>
          {/* Placeholder for Health Improvements content */}
          <View style={[styles.card, styles.healthImprovementCard]}>
            <Ionicons name="rocket-outline" size={60} color="#4CAF50" style={styles.rocketIcon} />
            <View style={styles.healthImprovementTextContainer}>
              <Text style={styles.upgradeTitle}>Upgrade QuitNow</Text>
              <Text style={styles.upgradeDescription}>Improve your health + Create your own goals
              + Unlimited access to the community + Forg...</Text>
            </View>
          </View>
        </View>

        {/* QuitPlan Section */}
        <TouchableOpacity onPress={handlePressQuitPlan}>
          <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quit Plan</Text>
          </View>
          <View style={[styles.card, styles.quitPlanCard]}>
            <Ionicons name="calendar-outline" size={60} color="#4CAF50" style={styles.rocketIcon} />
            <View style={styles.healthImprovementTextContainer}>
              <Text style={styles.upgradeTitle}>Your Quit Journey</Text>
              <Text style={styles.upgradeDescription}>Track your progress and follow your personalized quit plan...</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  communityImage: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    marginRight: 18,
  },
  communityImagePlaceholder: {
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityUsername: {
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 6,
    color: '#1A1A1A',
  },
  communityMessage: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  achievementsScroll: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  achievementCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementTitle: {
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 6,
    color: '#1A1A1A',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  healthImprovementCard: {
    backgroundColor: '#E8F5E9',
    padding: 25,
    borderRadius: 16,
  },
  rocketIcon: {
    marginRight: 25,
  },
  healthImprovementTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  upgradeDescription: {
    fontSize: 15,
    color: '#1B5E20',
    lineHeight: 22,
  },
  quitPlanCard: {
    backgroundColor: '#E3F2FD',
    padding: 25,
    borderRadius: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    paddingVertical: 15,
  },
  noBadgesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 15,
  },
});
