import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Share,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme, useThemeGuaranteed } from '../context/ThemeContext';
import { useStreak } from '../context/StreakContext';
import sessionService from '../services/sessionService';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';
import { BlurView } from 'expo-blur';
import { UserAnalytics } from '../lib/supabase';
import AnimatedProgressRing from '../components/AnimatedProgressRing';

const { width, height } = Dimensions.get('window');

// Mock data
const RECOVERY_TARGET_DAYS = 60; // Brain rewiring target (60 days)

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const themeResult = useThemeGuaranteed();
  const colors = themeResult?.colors;
  const { elapsedSeconds } = useStreak();
  const insets = useSafeAreaInsets();
  
  // Analytics data state for performance optimization
  const [analyticsData, setAnalyticsData] = useState<UserAnalytics | null>(null);
  
  // Star positions state - moved before conditional returns
  const [starPositions, setStarPositions] = useState(() => 
    Array.from({ length: 25 }, () => ({
      x: Math.random() * width * 2,
      y: Math.random() * height,
      opacity: Math.random() * 0.2 + 0.05,
      speed: Math.random() * 0.15 + 0.05,
      directionX: (Math.random() - 0.5) * 2,
      directionY: (Math.random() - 0.5) * 2,
      size: Math.random() * 1.5 + 0.5,
    }))
  );

  // Load analytics data using the optimized SessionService
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        // LIGHTNING FAST: Show data instantly from memory
        const localAnalytics = await sessionService.getLocalAnalytics();
        setAnalyticsData(localAnalytics);
        
        // Background sync (non-blocking, user doesn't wait)
        setTimeout(async () => {
          try {
            const dbAnalytics = await sessionService.getAnalyticsData();
            setAnalyticsData(dbAnalytics);
          } catch (dbError) {
            console.warn('Background sync failed, using local data:', dbError);
          }
        }, 50); // Minimal delay to not block UI
        
      } catch (error) {
        console.error('Error loading analytics data:', error);
      }
    };

    loadAnalyticsData();
  }, []);

  // Animated starfield - moved before conditional returns
  useEffect(() => {
    const starfieldInterval = setInterval(() => {
      setStarPositions(prevPositions => 
        prevPositions.map(star => {
          const newX = star.x + (star.directionX * star.speed);
          const newY = star.y + (star.directionY * star.speed);
          
          let wrappedX = newX;
          let wrappedY = newY;
          
          if (newX < -50) wrappedX = width + 50;
          if (newX > width + 50) wrappedX = -50;
          if (newY < -50) wrappedY = height + 50;
          if (newY > height + 50) wrappedY = -50;
          
          return {
            ...star,
            x: wrappedX,
            y: wrappedY,
          };
        })
      );
    }, 30);

    return () => {
      clearInterval(starfieldInterval);
    };
  }, []);
  
  // Calculate real progress data using analytics data when available
  const recoveryPercentage = sessionService.calculateBrainRewiringPercentage(elapsedSeconds);
  const daysToRecovery = RECOVERY_TARGET_DAYS - Math.floor(elapsedSeconds / (24 * 60 * 60));
  const estimatedRecoveryDate = new Date();
  estimatedRecoveryDate.setDate(estimatedRecoveryDate.getDate() + daysToRecovery);

  // Enhanced safety check for theme colors
  if (!colors || 
      typeof colors !== 'object' || 
      !colors.primaryBackground || 
      !colors.primaryText ||
      !colors.backgroundGradient) {
    console.warn('⚠️ AnalyticsScreen: Theme colors not ready, showing minimal loading');
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Loading theme...</Text>
      </View>
    );
  }

  // Benefits data with multi-color icon system
  const benefits = [
    {
      icon: 'custom',
      iconSource: require('../../assets/recovery-page-icons/increased-confidence.webp'),
      title: 'Improved Confidence',
      description: 'Feel more comfortable showing your hands in social and professional situations.',
      progress: 85,
      color: '#C1FF72', // Vibrant lime-green
    },
    {
      icon: 'custom',
      iconSource: require('../../assets/recovery-page-icons/healthy-nails.webp'),
      title: 'Healthier Nails',
      description: 'Your nails are becoming stronger and more resilient.',
      progress: 72,
      color: '#FFB366', // Warm orange
    },
    {
      icon: 'custom',
      iconSource: require('../../assets/recovery-page-icons/new-meditation-icon.webp'),
      title: 'Reduced Stress',
      description: 'Break the cycle of anxiety and nervous habits.',
      progress: 68,
      color: '#A8E6CF', // Soft mint
    },
    {
      icon: 'custom',
      iconSource: require('../../assets/recovery-page-icons/better-hygiene-icon.webp'),
      title: 'Better Hygiene',
      description: 'Eliminate bacteria and germs that can cause infections and illness.',
      progress: 78,
      color: '#FF6B9D', // Vibrant pink
    },
    {
      icon: 'custom',
      iconSource: require('../../assets/recovery-page-icons/willpower-icon.webp'),
      title: 'Mental Discipline',
      description: 'Build self-control and break negative habit patterns.',
      progress: 65,
      color: '#9B59B6', // Purple
    },
  ];

  const handleShare = async () => {
    try {
      await hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
      const streakDays = Math.floor(elapsedSeconds / (24 * 60 * 60));
      const message = `I'm ${Math.round(recoveryPercentage)}% through my nail-biting recovery on Nayl — ${streakDays} day streak and counting! 💪`;
      await Share.share(
        Platform.OS === 'ios'
          ? { message, title: 'My Nayl Recovery Progress' }
          : { message },
      );
    } catch (error) {
      console.warn('Share failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Consistent background gradient with particle starfield (same as Home) */}
      <LinearGradient
        colors={colors.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.55, 1]}
        style={styles.backgroundGradient}
      >
        <View style={styles.starfield}>
          {starPositions.map((star, index) => (
            <View
              key={index}
              style={[
                styles.star,
                {
                  left: star.x,
                  top: star.y,
                  opacity: star.opacity,
                  width: star.size,
                  height: star.size,
                },
              ]}
            />
          ))}
        </View>
      </LinearGradient>
      
      {/* Header - ABSOLUTE POSITIONING to prevent jolting */}
      <View style={[styles.header, { top: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home' as never)}>
            <Ionicons name="chevron-back" size={28} color={colors.primaryText} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.screenTitle, { color: colors.primaryText }]}>Analytics</Text>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare} accessibilityRole="button" accessibilityLabel="Share recovery progress">
            <Ionicons name="share-outline" size={28} color={colors.primaryText} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Content - ABSOLUTE POSITIONING to prevent jolting */}
      <ScrollView 
        style={[styles.content, { top: insets.top + 120 }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            <AnimatedProgressRing progress={recoveryPercentage} size={360} strokeWidth={16} />
            <View style={styles.progressTextContainer}>
              <Text style={[styles.progressLabel, { color: colors.secondaryText }]}>RECOVERY</Text>
              <Text style={[styles.progressPercentage, { color: colors.primaryText }]}>{Math.round(recoveryPercentage)}%</Text>
              <Text style={[styles.progressSubtext, { color: colors.secondaryText }]}>{Math.floor(elapsedSeconds / (24 * 60 * 60))} DAY STREAK</Text>
              <Text style={[styles.progressTarget, { color: colors.mutedText }]}>Progress to {RECOVERY_TARGET_DAYS} days (Brain Rewiring)</Text>
            </View>
          </View>
          
          {/* Enhanced Recovery Date Display */}
          <View style={styles.recoveryDateContainer}>
            <Text style={[styles.recoveryDateLabel, { color: colors.secondaryText }]}>
              You're on track to quit nail biting by:
            </Text>
            <View style={[styles.recoveryDateBox, { backgroundColor: colors.secondaryBackground, borderColor: colors.secondaryAccent }]}>
              <Text style={[styles.recoveryDateText, { color: colors.primaryText }]}>
                {estimatedRecoveryDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </View>
          
          {/* Enhanced Motivational Text */}
          <View style={[styles.motivationalContainer, { backgroundColor: colors.secondaryBackground, borderColor: colors.secondaryAccent }]}>
            <Text style={[styles.motivationalText, { color: colors.primaryText }]}>
              The first few days are always the hardest, but you've already shown incredible strength. Hold on to your reasons for starting this journey.
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.secondaryAccent }]} />

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={[styles.benefitsTitle, { color: colors.primaryText }]}>Why Stop Biting Your Nails?</Text>

          <View style={[styles.benefitsCard, { backgroundColor: colors.secondaryBackground, borderColor: colors.secondaryAccent }]}>
            {/* Subtle frosted glass effect */}
            <BlurView intensity={22} tint="dark" style={styles.benefitsBlur} />

            <View style={styles.benefitsCardBody}>
              {benefits.map((benefit, index) => (
                <React.Fragment key={index}>
                  <View style={styles.benefitRow}>
                    <View style={[styles.benefitIcon, { backgroundColor: benefit.color }]}>
                      <Image source={benefit.iconSource} style={styles.benefitIconImage} />
                    </View>
                    <View style={styles.benefitTextCol}>
                      <Text style={[styles.benefitTitle, { color: colors.primaryText }]}>{benefit.title}</Text>
                      <Text style={[styles.benefitDescription, { color: colors.secondaryText }]}>{benefit.description}</Text>
                      <View style={[styles.benefitProgressBg, { backgroundColor: colors.mutedText }]}>
                        <LinearGradient
                          colors={['#00D4FF', '#0099FF', '#0066FF']}
                          style={[
                            styles.benefitProgressFill,
                            { width: `${benefit.progress}%` }
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      </View>
                    </View>
                  </View>
                                     {index < benefits.length - 1 && (
                     <View style={[styles.benefitDivider, { backgroundColor: colors.secondaryAccent }]} />
                   )}
                   {/* Ensure last benefit has proper bottom spacing */}
                   {index === benefits.length - 1 && (
                     <View style={{ height: SPACING.md }} />
                   )}
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    ...TYPOGRAPHY.headingLarge,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  shareButton: {
    padding: SPACING.sm,
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SPACING.lg,
  },
  contentContainer: {
    paddingBottom: SPACING.xxl, // Increased padding to ensure all content is visible
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    width: 360,
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    letterSpacing: 1.2,
  },
  progressPercentage: {
    ...TYPOGRAPHY.displayLarge,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(193, 255, 114, 0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  progressSubtext: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  progressTarget: {
    ...TYPOGRAPHY.caption,
    opacity: 0.8,
  },
  recoveryDateContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recoveryDateLabel: {
    ...TYPOGRAPHY.bodyMedium,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  recoveryDateBox: {
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  recoveryDateText: {
    ...TYPOGRAPHY.headingSmall,
    fontWeight: '600',
  },
  motivationalContainer: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    maxWidth: width - 80,
    ...SHADOWS.card,
  },
  motivationalText: {
    ...TYPOGRAPHY.bodyMedium,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: SPACING.lg,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.md,
  },
  benefitsSection: {
    marginBottom: SPACING.xl, // Increased margin for better spacing
  },
  benefitsTitle: {
    ...TYPOGRAPHY.headingMedium,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  benefitsCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.card,
    overflow: 'hidden',
    minHeight: 400, // Ensure card has enough height for all benefits
  },
  benefitsBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  benefitsCardBody: {
    padding: SPACING.xl, // Increased padding for better content visibility
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start' for better alignment
    marginBottom: SPACING.lg, // Increased spacing between benefit rows for better visibility
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    overflow: 'hidden',
    marginTop: 2, // Small top margin to align with the title text
  },
  benefitIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  benefitTextCol: {
    flex: 1,
    paddingTop: 2, // Small top padding to align with the icon
  },
  benefitTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  benefitDescription: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SPACING.md, // Increased bottom margin
    lineHeight: 22, // Increased line height for better readability
  },
  benefitProgressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  benefitProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  benefitDivider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    ...TYPOGRAPHY.headingLarge,
    fontWeight: '700',
  },
});

export default AnalyticsScreen; 