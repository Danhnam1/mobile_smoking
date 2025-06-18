import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../api/index';

const { width } = Dimensions.get('window');

// ProgressCircle: hiển thị vòng tròn tiến trình
const ProgressCircle = ({ progress, size = 13, strokeWidth = 2, color = '#FF6B35', bgColor = '#FAD2C4', style }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  return (
    <Svg width={size} height={size} style={style}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={bgColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference},${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </Svg>
  );
};

const BadgeScreen = ({ navigation, isHomeScreen = true }) => {
  const { user, token } = useAuth();
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const allRes = await fetch(`${API_BASE_URL}/badges`, { headers });
        const allData = await allRes.json();
        const userRes = await fetch(`${API_BASE_URL}/badges/user`, { headers });
        const userData = await userRes.json();
        const memRes = await fetch(`${API_BASE_URL}/user-membership/me`, { headers });
        const memData = memRes.status === 200 ? await memRes.json() : null;
        
        setAllBadges(allData.badges || []);
        setUserBadges(userData.badges || []);
        setMembership(memData);
      } catch (err) {
        console.error('Badge API error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAll();
  }, [token]);

  const achievedIds = userBadges.map(b => b._id);
  const isPro = membership?.package_id?.name === 'pro' && membership?.status === 'active';

  // Sort badges by priority: achieved -> near achieved -> rare -> others
  const sortBadges = (badges) => {
    return badges.sort((a, b) => {
      const aAchieved = achievedIds.includes(a._id);
      const bAchieved = achievedIds.includes(b._id);
      const aProOnly = a.proOnly;
      const bProOnly = b.proOnly;
      
      // First: achieved badges
      if (aAchieved && !bAchieved) return -1;
      if (!aAchieved && bAchieved) return 1;
      
      // Second: near achieved (non-pro badges that are not achieved)
      if (!aAchieved && !bAchieved) {
        if (!aProOnly && bProOnly) return -1;
        if (aProOnly && !bProOnly) return 1;
      }
      
      // Third: rare badges (pro-only)
      if (aProOnly && bProOnly) {
        // Sort by name for pro badges
        return a.name.localeCompare(b.name);
      }
      
      // Finally: sort by name
      return a.name.localeCompare(b.name);
    });
  };

  const sortedBadges = sortBadges([...allBadges]);
  const displayBadges = isHomeScreen ? sortedBadges.slice(0, 5) : sortedBadges;

  const getBadgeIcon = (badge) => {
    if (badge.proOnly && !isPro) return "lock-closed";
    if (achievedIds.includes(badge._id)) return "trophy";
    return "trophy-outline";
  };

  const getBadgeColor = (badge) => {
    const achieved = achievedIds.includes(badge._id);
    const isProBadge = badge.proOnly;
    const isLocked = isProBadge && !isPro;
    
    if (isLocked) return '#9E9E9E';
    if (achieved) return '#FFD700'; // Gold for achieved
    if (isProBadge) return '#FF6B35'; // Orange for pro badges
    return 'black'; // Black for not yet achieved
  };

  const getBadgeBackground = (badge) => {
    const achieved = achievedIds.includes(badge._id);
    const isProBadge = badge.proOnly;
    const isLocked = isProBadge && !isPro;
    
    if (isLocked) return '#F8F9FA';
    if (achieved) return '#FFF8E1';
    if (isProBadge) return '#FFF3E0';
    return '#fff'; // White for not yet achieved
  };

  const getBadgeBorderColor = (badge) => {
    const achieved = achievedIds.includes(badge._id);
    const isProBadge = badge.proOnly;
    const isLocked = isProBadge && !isPro;
    
    if (isLocked) return '#E0E0E0';
    if (achieved) return '#FFD700';
    if (isProBadge) return '#FF6B35';
    return '#696969'; // Black for not yet achieved
  };

  // Hàm tính progress cho từng badge (giả định: badge có targetDays, userBadge có currentDays)
  const getBadgeProgress = (badge) => {
    // Nếu đã đạt, trả về 1
    if (achievedIds.includes(badge._id)) return 1;
    // Giả định badge có trường targetDays, userBadge có currentDays
    const userBadge = userBadges.find(b => b._id === badge._id);
    if (badge.targetDays && userBadge && userBadge.currentDays) {
      return Math.min(userBadge.currentDays / badge.targetDays, 1);
    }
    // Nếu không có dữ liệu, trả về 0
    return 0;
  };

  const handleSeeAll = () => {
    if (navigation) {
      navigation.navigate('AllBadges');
    }
  };

  const renderBadgeCard = (badge) => {
    const achieved = achievedIds.includes(badge._id);
    const isProBadge = badge.proOnly;
    const isLocked = isProBadge && !isPro;
    const iconName = getBadgeIcon(badge);
    const iconColor = getBadgeColor(badge);
    const backgroundColor = getBadgeBackground(badge);
    const borderColor = getBadgeBorderColor(badge);
    const progress = getBadgeProgress(badge);

    return (
      <View
        key={badge._id}
        style={[
          styles.achievementCard,
          { 
            backgroundColor,
            borderColor,
            borderWidth: achieved || isProBadge ? 2 : 1,
          },
          isLocked && styles.achievementCardLocked,
          !isHomeScreen && styles.gridCard,
        ]}
      >
        <View style={styles.badgeIconContainer}>
          {/* Vòng tròn tiến trình nhỏ ở góc phải trên */}
          {!achieved && (
            <ProgressCircle progress={progress} style={styles.progressCircle} />
          )}
          <Ionicons
            name={iconName}
            size={isHomeScreen ? 40 : 50}
            color={iconColor}
            style={isLocked ? { opacity: 0.5 } : {}}
          />
          {achieved && (
            <View style={styles.achievedIndicator}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            </View>
          )}
        </View>
        <Text style={[styles.achievementTitle, isLocked && styles.lockedText]}>
          {badge.name}
        </Text>
        <Text style={[styles.achievementDescription, isLocked && styles.lockedText]}>
          {badge.description}
        </Text>
        {!achieved && (
          <Text style={styles.notAchievedText}>Not yet achieved</Text>
        )}
        {isLocked && (
          <View style={styles.proBadgeContainer}>
            <Ionicons name="diamond" size={12} color="#FFD700" />
            <Text style={styles.proBadgeLabel}>Pro Only</Text>
          </View>
        )}
        {achieved && (
          <View style={styles.achievedContainer}>
            <Text style={styles.achievedLabel}>Đã đạt được</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.sectionContainer, !isHomeScreen && styles.fullScreenContainer]}>
      {isHomeScreen && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Huy hiệu</Text>
          <TouchableOpacity onPress={handleSeeAll} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải huy hiệu...</Text>
        </View>
      ) : (
        <ScrollView 
          horizontal={isHomeScreen} 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={[
            styles.achievementsScroll,
            !isHomeScreen && styles.gridContainer
          ]}
        >
          {displayBadges.map(renderBadgeCard)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  fullScreenContainer: {
    marginTop: 0,
    marginHorizontal: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  achievementsScroll: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  achievementCard: {
    width: 160,
    marginRight: 15,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  gridCard: {
    width: (width - 60) / 2,
    marginRight: 0,
    marginBottom: 15,
  },
  badgeIconContainer: {
    position: 'relative',
    marginBottom: 12,
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    position: 'absolute',
    top: -2,
    right: -40,
    zIndex: 2,
  },
  achievedIndicator: {
    position: 'absolute',
    top: -2,
    right: -40,
    borderRadius: 10,
    padding: 2,
  },
  achievementTitle: {
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 6,
    color: '#1A1A1A',
    lineHeight: 18,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  lockedText: {
    color: '#9E9E9E',
  },
  achievementCardLocked: {
    opacity: 1,
  },
  proBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  proBadgeLabel: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 10,
    marginLeft: 4,
  },
  achievedContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  achievedLabel: {
    color: '#4CAF50',
    fontWeight: '700',
    fontSize: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  notAchievedText: {
    color: '#BDBDBD',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
    fontWeight: '400',
  },
});

export default BadgeScreen; 