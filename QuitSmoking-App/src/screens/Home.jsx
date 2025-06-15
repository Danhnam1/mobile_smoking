import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Button } from 'react-native';
import { AntDesign, FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { getAllBadges, fetchUserProgress, fetchSmokingStatus, fetchQuitPlan } from '../api';
import { getProgressByStage, getTotalCigarettesInPeriod, getTotalMoneySpentInPeriod } from '../api/progressTracking';
import AppHeader from '../components/AppHeader';
import HomeHeaderAndProgressCard from '../components/HomeHeaderAndProgressCard';
import HomeStatsSection from '../components/HomeStatsSection';
import HomeHealthImprovementSection from '../components/HomeHealthImprovementSection';
import HomeQuickActionsSection from '../components/HomeQuickActionsSection';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    console.log('Home.jsx useEffect: User data:', user);
    console.log('Home.jsx useEffect: User token:', token);

    const loadData = async () => {
      try {
        // Fetch achievements first (usually not dependent on login status)
        const badgesData = await getAllBadges();
        setAchievements(badgesData.badges);

        // Fetch progress data ONLY if user ID and token are available from AuthContext
        if (user && token) {
          // Fetch the user's quit plan to get planId and potentially stageId
          const quitPlan = await fetchQuitPlan(user._id, token);
          console.log('Fetched Quit Plan:', quitPlan); // Log the quitPlan to inspect its structure

          let actualPlanId = null;
          let actualStageId = null;

          if (quitPlan) {
            actualPlanId = quitPlan._id; // Assuming _id of the plan is the planId
            // TODO: Determine the actual stageId based on the 'Fetched Quit Plan' log.
            // It might be quitPlan.currentStageId, quitPlan.activeStage._id, or similar.
            actualStageId = quitPlan.currentStage?._id || quitPlan.activeStage?._id || quitPlan.stages?.[0]?._id || 'default_stage_id'; // **ADJUST THIS LINE BASED ON YOUR ACTUAL quitPlan STRUCTURE**
            // If quitPlan does not contain stageId, you might need another API call here.

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const [progressRecords, totalCigarettes, totalMoneySpent] = await Promise.all([
              getProgressByStage(actualPlanId, actualStageId, token),
              getTotalCigarettesInPeriod(actualPlanId, actualStageId, startDate, endDate, token),
              getTotalMoneySpentInPeriod(actualPlanId, actualStageId, startDate, endDate, token)
            ]);

            const firstRecord = progressRecords[0];
            const daysQuit = firstRecord ? Math.floor((new Date() - new Date(firstRecord.date)) / (1000 * 60 * 60 * 24)) : 0;
            const cigarettesAvoided = totalCigarettes.total || 0;
            const moneySaved = totalMoneySpent.total || 0;

            setProgressData({
              daysQuit,
              cigarettesAvoided,
              moneySaved
            });
          } else {
            console.log('No quit plan found for the user. Progress data will be 0.');
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
    };

    // Trigger loadData when user or token from AuthContext changes
    loadData();
  }, [user, token]);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Overall Progress Card */}
        <HomeHeaderAndProgressCard progressData={progressData} />

        {/* Community Section */}
        <TouchableOpacity style={styles.sectionContainer} onPress={() => navigation.navigate('Community')}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community</Text>
          </View>
          {/* Placeholder for Community content */}
          <View style={styles.card}>
            <View style={[styles.communityImage, styles.communityImagePlaceholder]}>
              <Ionicons name="people" size={30} color="#FFF" />
            </View>
            <View>
              <Text style={styles.communityUsername}>LuciFaye613</Text>
              <Text style={styles.communityMessage}>cố cán mốc 100 ngày đầu</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Achievements Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badge</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          {/* Render achievements dynamically */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
            {loadingBadges ? (
              <Text style={styles.loadingText}>Đang tải huy hiệu...</Text>
            ) : badgesError ? (
              <Text style={styles.errorText}>{badgesError}</Text>
            ) : Array.isArray(achievements) && achievements.length > 0 ? (
              achievements.map((achievement) => (
                <View key={achievement._id} style={styles.achievementCard}>
                  <Ionicons name="trophy-outline" size={50} color="#4CAF50" />
                  <Text style={styles.achievementTitle}>{achievement.name}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noBadgesText}>Không có huy hiệu nào.</Text>
            )}
          </ScrollView>
        </View>

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

        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  communityImagePlaceholder: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityUsername: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  communityMessage: {
    fontSize: 14,
    color: '#555',
  },
  achievementsScroll: {
    paddingHorizontal: 0,
    paddingVertical: 5,
  },
  achievementCard: {
    width: 150,
    marginRight: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  healthImprovementCard: {
    backgroundColor: '#E8F5E9',
    padding: 20,
  },
  rocketIcon: {
    marginRight: 20,
  },
  healthImprovementTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  upgradeDescription: {
    fontSize: 14,
    color: '#555',
  },
  linkText: {
    color: '#4ECB71',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    paddingVertical: 10,
  },
  noBadgesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 10,
  }
});
