import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import triggerService, { TriggerStats } from '../services/triggerService';
import { TriggerEntry } from '../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TriggerHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [triggerHistory, setTriggerHistory] = useState<TriggerEntry[]>([]);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [stats, setStats] = useState<TriggerStats>({
    totalEpisodes: 0,
    thisWeek: 0,
    mostCommonTime: 'Evening',
    mostCommonTrigger: 'Stress',
    mostCommonTriggerCount: 0,
  });
  const insets = useSafeAreaInsets();

  // Star positions for randomized animation (like HomeScreen and ProfileScreen)
  const [starPositions, setStarPositions] = useState(() => 
    Array.from({ length: 100 }, () => ({
      x: Math.random() * 400,
      y: Math.random() * 800,
      opacity: Math.random() * 0.9 + 0.15,
      speed: Math.random() * 0.15 + 0.03,
      directionX: (Math.random() - 0.5) * 1.5,
      directionY: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2.2 + 0.5,
    }))
  );

  // Load trigger history from storage
  useEffect(() => {
    loadTriggerHistory();
  }, []);

  // Starfield animation effect
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setStarPositions(prevStars => 
        prevStars.map(star => {
          let newX = star.x + star.directionX * star.speed;
          let newY = star.y + star.directionY * star.speed;
          
          // Reset stars that go off screen
          if (newX > 400) newX = 0;
          if (newX < 0) newX = 400;
          if (newY > 800) newY = 0;
          if (newY < 0) newY = 800;
          
          return {
            ...star,
            x: newX,
            y: newY,
          };
        })
      );
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(animationInterval);
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTriggerHistory();
    }, [])
  );

  const loadTriggerHistory = async () => {
    const history = await triggerService.getTriggerHistory();
    setTriggerHistory(history);
    const stats = triggerService.calculateStats(history);
    setStats(stats);
  };

  const getFilteredHistory = () => {
    return triggerService.getFilteredHistory(triggerHistory, selectedFilter);
  };

  const formatTime = (timestamp: string | Date) => {
    // Handle the case where timestamp might be undefined or null
    if (!timestamp) {
      return 'Unknown time';
    }

    // Convert string timestamp to Date object if needed
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Get the time in 12-hour format
    const timeString = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    // If it's today, show just the time
    if (diffInDays === 0) {
      return timeString;
    }
    
    // If it's yesterday, show "Yesterday, time"
    if (diffInDays === 1) {
      return `Yesterday, ${timeString}`;
    }
    
    // If it's within the last 7 days, show "Day, time"
    if (diffInDays < 7) {
      const dayName = date.toLocaleDateString([], { weekday: 'short' });
      return `${dayName}, ${timeString}`;
    }
    
    // For older dates, show "Month Day, time"
    const monthDay = date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
    return `${monthDay}, ${timeString}`;
  };

  // Helper function to capitalize trigger names
  const capitalizeTrigger = (trigger: string): string => {
    return trigger.charAt(0).toUpperCase() + trigger.slice(1).toLowerCase();
  };


  const filters = ['All', 'Stress', 'Anxiety', 'Boredom'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Background with Gradient - EXACTLY like Profile page */}
      <LinearGradient
        colors={colors.backgroundGradient || ['#000000', '#000000', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.55, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1, // Ensure it's behind all content
        }}
      />
      
      {/* Starfield Animation - Like HomeScreen and ProfileScreen */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
        {starPositions.map((star, index) => (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: star.size / 2,
              opacity: star.opacity * 0.4,
              shadowColor: 'rgba(255, 255, 255, 0.2)',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 1,
              elevation: 1,
            }}
          />
        ))}
      </View>
      
      {/* Header - Fixed at top */}
      <View style={[styles.header, { top: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home' as never)}>
            <Ionicons name="chevron-back" size={28} color={colors.primaryText || '#FFFFFF'} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Journal</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >

        {/* Most Common Trigger Section - Enhanced */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={20} color={colors.primaryAccent || '#60A5FA'} />
            <Text style={styles.mostCommonTriggerLabel}>Most Common Trigger</Text>
          </View>
          <View style={styles.triggerCardWrapper}>
            <View style={styles.triggerCardInner}>
              <View style={styles.mostCommonTrigger}>
                <Text style={styles.triggerEmoji}>{triggerService.getTriggerEmoji(stats.mostCommonTrigger)}</Text>
                <Text style={styles.triggerName}>{capitalizeTrigger(stats.mostCommonTrigger)}</Text>
                <Text style={styles.triggerCount}>{stats.mostCommonTriggerCount}x</Text>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.totalEpisodes}</Text>
                  <Text style={styles.statLabel}>Total Episodes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.thisWeek}</Text>
                  <Text style={styles.statLabel}>This Week</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>44%</Text>
                  <Text style={styles.statLabel}>{stats.mostCommonTime}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Pattern Detected Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.08)', 'rgba(59, 130, 246, 0.03)', 'rgba(255, 255, 255, 0.01)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.patternCard}
          >
            <View style={styles.patternHeader}>
              <Ionicons name="flash" size={16} color={colors.primaryAccent || '#60A5FA'} />
              <Text style={styles.patternTitle}>Pattern Detected</Text>
            </View>
            <Text style={styles.patternText}>
              You tend to bite your nails when{' '}
              <Text style={styles.highlightedText}>stressed</Text> in the{' '}
              <Text style={styles.highlightedText}>evening</Text>, especially between{' '}
              <Text style={styles.highlightedText}>8-10 PM</Text>. Consider a bedtime routine to manage stress.
            </Text>
          </LinearGradient>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter.toLowerCase() && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.toLowerCase())}
            >
              <Text 
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter.toLowerCase() && styles.filterButtonTextActive
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Episodes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recent Episodes</Text>
          <View style={styles.episodesContainer}>
            {getFilteredHistory().slice(0, showAllEpisodes ? undefined : 3).map((entry) => (
              <LinearGradient
                key={entry.id}
                colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.episodeItem}
              >
                <Text style={styles.episodeEmoji}>{entry.emoji}</Text>
                <View style={styles.episodeContent}>
                  <Text style={styles.episodeTrigger}>{capitalizeTrigger(entry.trigger)}</Text>
                  <Text style={styles.episodeDetails}>
                    {entry.details || 'No details provided'}
                  </Text>
                </View>
                <Text style={styles.episodeTime}>
                  {formatTime(entry.timestamp)}
                </Text>
              </LinearGradient>
            ))}
            
            {/* Show More/Less Button */}
            {getFilteredHistory().length > 3 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllEpisodes(!showAllEpisodes)}
              >
                <Text style={styles.showMoreButtonText}>
                  {showAllEpisodes ? 'Show Less' : `Show ${getFilteredHistory().length - 3} More`}
                </Text>
                <Ionicons
                  name={showAllEpisodes ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#FFFFFF"
                  style={{ marginLeft: SPACING.xs }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A', // Changed from COLORS.primaryBackground
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
     backButton: {
     padding: SPACING.sm,
   },
   headerTitle: {
     fontSize: 36, // Match Analytics header size
     color: '#FFFFFF',
     flex: 1,
     textAlign: 'center',
     fontWeight: '700',
     letterSpacing: 0.5,
     textShadowColor: '#000000',
     textShadowOffset: { width: 0, height: 1 },
     textShadowRadius: 2,
     shadowColor: '#000000',
     shadowOffset: { width: 0, height: 0 },
     shadowOpacity: 0.1,
     shadowRadius: 1,
   },
   headerSpacer: {
     width: 48, // Same width as back button for balance
   },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 100, // Account for header height
  },
  contentContainer: {
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#FFFFFF', // Standard white for consistency
    marginLeft: SPACING.sm,
    fontWeight: '700',
    textTransform: 'none',
    textShadowColor: 'rgba(255, 255, 255, 0.3)', // White shadow to match
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mostCommonTriggerLabel: {
    fontSize: 16,
    color: '#DC2626', // Premium red for Most Common Trigger heading only
    marginLeft: SPACING.sm,
    fontWeight: '700',
    textTransform: 'none',
    textShadowColor: 'rgba(220, 38, 38, 0.3)', // Red shadow to match
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  triggerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(147, 51, 234, 0.3)',
    marginBottom: SPACING.md,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  triggerCardWrapper: {
    backgroundColor: '#0F172A',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.md,
  },
  triggerCardInner: {
    overflow: 'hidden',
  },
  mostCommonTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  triggerEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
    textShadowColor: 'rgba(147, 51, 234, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  triggerName: {
    fontSize: 24,
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  triggerCount: {
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#EF4444',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    fontWeight: '800',
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#E5E7EB',
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
  patternCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  patternTitle: {
    fontSize: 16,
    color: '#FFFFFF', // Standard white for consistency
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  patternText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  highlightedText: {
    color: '#DC2626', // Premium red for trigger words
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  filterButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Subtle white background for consistency
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Subtle white border for consistency
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flex: 1,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#60A5FA',
    borderColor: '#60A5FA',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 12,
    color: '#FFFFFF', // Standard white for consistency across the app
    fontWeight: '500',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  episodeEmoji: {
    fontSize: 18,
    marginRight: SPACING.md,
  },
  episodeContent: {
    flex: 1,
  },
  episodeTrigger: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  episodeDetails: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  episodeTime: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  episodesContainer: {
    marginTop: SPACING.md, // Add padding between heading and episodes
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  showMoreButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default TriggerHistoryScreen; 