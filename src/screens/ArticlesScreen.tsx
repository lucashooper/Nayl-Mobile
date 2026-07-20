import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import sessionService from '../services/sessionService';

const COMPLETED_ARTICLES_BASE = 'completedArticles';

async function getCompletedArticlesKey(): Promise<string> {
  return sessionService.getUserStorageKey(COMPLETED_ARTICLES_BASE);
}
import { useFocusEffect } from '@react-navigation/native';
import { useDimensions } from '../hooks/useDimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemeGuaranteed } from '../context/ThemeContext';
import { useAchievements } from '../context/AchievementContext';
import AchievementOverlay from '../components/AchievementOverlay';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

interface ArticlesScreenProps {
  navigation: any;
}

const ArticlesScreen: React.FC = () => {
  const { width, height } = useDimensions();
  const { colors } = useTheme();
  const { checkAndUnlockAchievements, currentOverlay, isOverlayVisible, hideAchievementOverlay } = useAchievements();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const themeResult = useTheme();

  // Progress tracking state
  const [completedArticles, setCompletedArticles] = useState<Set<string>>(new Set());
  const [progressData, setProgressData] = useState({
    'nail-biting-psychology': 0,
    'health-effects': 0,
    'quitting-benefits': 0,
    'recovery-strategies': 0,
  });

  // Star positions for randomized animation
  const [starPositions, setStarPositions] = useState(() => 
    Array.from({ length: 50 }, () => ({
      x: Math.random() * width * 2,
      y: Math.random() * height,
      opacity: Math.random() * 0.8 + 0.1,
      speed: Math.random() * 0.15 + 0.03,
      directionX: (Math.random() - 0.5) * 1.5,
      directionY: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2.2 + 0.5,
    }))
  );

  // Load completed articles from storage
  useEffect(() => {
    loadCompletedArticles();
  }, []);

  // Refresh progress when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCompletedArticles();
    }, [])
  );

  // Animate starfield
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
    }, 100); // Increased from 20ms to 100ms for better performance

    return () => clearInterval(starfieldInterval);
  }, []);

  const loadCompletedArticles = async () => {
    try {
      const key = await getCompletedArticlesKey();
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const completed = new Set(JSON.parse(stored) as string[]);
        setCompletedArticles(completed);
        calculateProgress(completed);
      }
    } catch (error) {
      console.log('Error loading completed articles:', error);
    }
  };

  const calculateProgress = (completed: Set<string>) => {
    const sectionArticles = {
      'nail-biting-psychology': ['nail-biting-psychology'],
      'health-effects': ['tiny-bites-big-risks', 'teeth-jaws-damage', 'skin-scars-lasting-impression', 'self-esteem-social-snags'],
      'quitting-benefits': ['cleaner-hands-sharper-health', 'stronger-smile-ahead', 'hands-feel-confident-again', 'calmer-mind-healthier-coping'],
      'recovery-strategies': ['trim-file-distract', 'bitter-defender-pretty-armor', 'mindful-awareness', 'rewards-routine'],
    };

    const newProgress = { ...progressData };
    Object.keys(sectionArticles).forEach(section => {
      const articles = sectionArticles[section as keyof typeof sectionArticles];
      const completedCount = articles.filter(article => completed.has(article)).length;
      newProgress[section as keyof typeof newProgress] = Math.round((completedCount / articles.length) * 100);
    });

    setProgressData(newProgress);
    
    // Check for achievements based on article completion
    const totalArticlesRead = completed.size;
    checkAndUnlockAchievements({
      currentStreak: 0, // Will be updated from HomeScreen
      totalArticlesRead,
      brainRewiringProgress: 0, // Will be updated from HomeScreen
    });
  };

  const handleArticlePress = (articleId: string) => {
    navigation.navigate('ArticleDetail', { articleId });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Create styles with access to colors
  const createStyles = () => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    background: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    starryOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
    },
    star: {
      position: 'absolute',
      backgroundColor: 'white',
      opacity: 0.1,
    },
    header: {
      position: 'absolute',
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.lg,
      zIndex: 10,
      // paddingTop: insets.top + 20, // This line is removed as per edit hint
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...TYPOGRAPHY.headingLarge,
      color: colors.primaryText,
      fontWeight: '700',
      letterSpacing: 0.5, // Improved letter spacing
      // Premium layered shadows - base shadow + accent shadow
      textShadowColor: colors.primaryBackground,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      // Additional premium accent shadow
      shadowColor: colors.primaryAccent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    headerSpacer: {
      width: 40,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
      paddingTop: 120, // Add proper top padding to account for header
    },
    section: {
      marginBottom: SPACING.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    sectionTitle: {
      ...TYPOGRAPHY.headingSmall,
      color: colors.primaryText,
      fontWeight: '600',
    },
    progressContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.sm,
    },
    progressText: {
      ...TYPOGRAPHY.caption,
      color: colors.secondaryText,
      fontSize: 12,
    },
    articlesRow: {
      paddingRight: SPACING.lg,
    },
    articlesScrollView: {
      // Add any specific styles for the ScrollView if needed
    },
    articleCard: {
      width: 280,
      height: 160,
      marginRight: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    articleGradient: {
      flex: 1,
      padding: SPACING.md,
      justifyContent: 'space-between',
      position: 'relative',
    },

    articleContent: {
      flex: 1,
      justifyContent: 'center',
    },
    articleTitle: {
      ...TYPOGRAPHY.bodyMedium,
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 15,
      marginBottom: SPACING.xs,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    articleSubtitle: {
      ...TYPOGRAPHY.caption,
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: 11,
      lineHeight: 14,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    articleIcon: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    placeholderCard: {
      width: 280,
      height: 160,
      marginRight: SPACING.md,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: colors.glassBackground,
      borderWidth: 2,
      borderColor: colors.glassBorder,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderContent: {
      alignItems: 'center',
    },
    placeholderText: {
      ...TYPOGRAPHY.caption,
      color: colors.secondaryText,
      marginTop: SPACING.xs,
      textAlign: 'center',
    },
  });

  const styles = createStyles();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background with starry effect */}
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.background}
      >
        {/* Subtle starfield effect */}
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
                borderRadius: star.size / 2,
              },
            ]}
          />
        ))}
      </LinearGradient>
      
      {/* Starry overlay effect */}
      <View style={styles.starryOverlay} />

      {/* Header */}
      <View style={[styles.header, { top: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Articles</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nail Biting Psychology Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nail Biting Psychology</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{progressData['nail-biting-psychology']}% Complete</Text>
            </View>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.articlesRow}
            style={styles.articlesScrollView}
          >
                         {/* Article 1: The Psychology Behind Nail Biting */}
             <TouchableOpacity 
               style={styles.articleCard}
               onPress={() => handleArticlePress('nail-biting-psychology')}
             >
               <LinearGradient
                 colors={['rgba(139, 92, 246, 0.8)', 'rgba(168, 85, 247, 0.6)', 'rgba(147, 51, 234, 0.7)']}
                 style={styles.articleGradient}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
               >
                 <View style={styles.articleContent}>
                   <Text style={styles.articleTitle}>
                     The Psychology Behind Nail Biting
                   </Text>
                   <Text style={styles.articleSubtitle}>
                     Understanding the hidden disorder and its mental health connections
                   </Text>
                 </View>
                 <View style={styles.articleIcon}>
                   <Ionicons name="book-outline" size={20} color="#FFFFFF" />
                 </View>
               </LinearGradient>
             </TouchableOpacity>

          </ScrollView>
        </View>

        {/* Health Effects Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Effects</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{progressData['health-effects']}% Complete</Text>
            </View>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.articlesRow}
            style={styles.articlesScrollView}
          >
                         {/* Article 1: Tiny Bites, Big Risks */}
             <TouchableOpacity 
               style={styles.articleCard}
               onPress={() => handleArticlePress('tiny-bites-big-risks')}
             >
               <LinearGradient
                 colors={['rgba(239, 68, 68, 0.7)', 'rgba(220, 38, 38, 0.5)', 'rgba(185, 28, 28, 0.6)']}
                 style={styles.articleGradient}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
               >
                 <View style={styles.articleContent}>
                   <Text style={styles.articleTitle}>
                     Tiny Bites, Big Risks
                   </Text>
                   <Text style={styles.articleSubtitle}>
                     Germs, infections, and bloodstream concerns from nail biting
                   </Text>
                 </View>
                 <View style={styles.articleIcon}>
                   <Ionicons name="warning-outline" size={20} color="#FFFFFF" />
                 </View>
               </LinearGradient>
             </TouchableOpacity>

            {/* Article 2: Teeth and Jaws Aren't Safe Either */}
            <TouchableOpacity 
              style={styles.articleCard}
              onPress={() => handleArticlePress('teeth-jaws-damage')}
            >
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.7)', 'rgba(37, 99, 235, 0.5)', 'rgba(29, 78, 216, 0.6)']}
                style={styles.articleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>
                    Teeth and Jaws Aren't Safe Either
                  </Text>
                  <Text style={styles.articleSubtitle}>
                    Enamel damage, cracked teeth, and jaw alignment problems
                  </Text>
                </View>
                <View style={styles.articleIcon}>
                  <Ionicons name="medical-outline" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Article 3: Skin and Scars—A Lasting Impression */}
            <TouchableOpacity 
              style={styles.articleCard}
              onPress={() => handleArticlePress('skin-scars-lasting-impression')}
            >
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.7)', 'rgba(5, 150, 105, 0.5)', 'rgba(4, 120, 87, 0.6)']}
                style={styles.articleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>
                    Skin and Scars—A Lasting Impression
                  </Text>
                  <Text style={styles.articleSubtitle}>
                    Hangnails, bleeding skin, and permanent nail damage
                  </Text>
                </View>
                <View style={styles.articleIcon}>
                  <Ionicons name="body-outline" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Article 4: Self-Esteem and Social Snags */}
            <TouchableOpacity 
              style={styles.articleCard}
              onPress={() => handleArticlePress('self-esteem-social-snags')}
            >
              <LinearGradient
                colors={['rgba(168, 85, 247, 0.7)', 'rgba(147, 51, 234, 0.5)', 'rgba(126, 34, 206, 0.6)']}
                style={styles.articleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>
                    Self-Esteem and Social Snags
                  </Text>
                  <Text style={styles.articleSubtitle}>
                    Confidence issues and social interaction challenges
                  </Text>
                </View>
                <View style={styles.articleIcon}>
                  <Ionicons name="people-outline" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Quitting Benefits Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quitting Benefits</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{progressData['quitting-benefits']}% Complete</Text>
            </View>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.articlesRow}
            style={styles.articlesScrollView}
          >
            {/* Article 1: Cleaner Hands, Sharper Health */}
            <TouchableOpacity 
              style={styles.articleCard}
              onPress={() => handleArticlePress('cleaner-hands-sharper-health')}
            >
              <LinearGradient
                colors={['rgba(34, 197, 94, 0.7)', 'rgba(22, 163, 74, 0.5)', 'rgba(21, 128, 61, 0.6)']}
                style={styles.articleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>
                    Cleaner Hands, Sharper Health
                  </Text>
                  <Text style={styles.articleSubtitle}>
                    Fewer colds, less throat irritation, and stronger immunity
                  </Text>
                </View>
                <View style={styles.articleIcon}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Article 2: Stronger Smile Ahead */}
            <TouchableOpacity 
              style={styles.articleCard}
              onPress={() => handleArticlePress('stronger-smile-ahead')}
            >
              <LinearGradient
                colors={['rgba(14, 165, 233, 0.7)', 'rgba(6, 182, 212, 0.5)', 'rgba(8, 145, 178, 0.6)']}
                style={styles.articleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>
                    Stronger Smile Ahead
                  </Text>
                  <Text style={styles.articleSubtitle}>
                    Preserved enamel, stronger teeth, and jaw relief
                  </Text>
                </View>
                <View style={styles.articleIcon}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Article 3: Hands That Feel Confident Again */}
            <TouchableOpacity 
              style={styles.articleCard}
              onPress={() => handleArticlePress('hands-feel-confident-again')}
            >
              <LinearGradient
                colors={['rgba(236, 72, 153, 0.7)', 'rgba(219, 39, 119, 0.5)', 'rgba(190, 24, 93, 0.6)']}
                style={styles.articleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>
                    Hands That Feel Confident Again
                  </Text>
                  <Text style={styles.articleSubtitle}>
                    Boosted self-image and reduced social anxiety
                  </Text>
                </View>
                <View style={styles.articleIcon}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Article 4: Calmer Mind, Healthier Coping */}
            <TouchableOpacity 
              style={styles.articleCard}
              onPress={() => handleArticlePress('calmer-mind-healthier-coping')}
            >
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.7)', 'rgba(217, 119, 6, 0.5)', 'rgba(180, 83, 9, 0.6)']}
                style={styles.articleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>
                    Calmer Mind, Healthier Coping
                  </Text>
                  <Text style={styles.articleSubtitle}>
                    Better stress habits and purposeful anxiety management
                  </Text>
                </View>
                <View style={styles.articleIcon}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Recovery Strategies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recovery Strategies</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{progressData['recovery-strategies']}% Complete</Text>
            </View>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.articlesRow}
            style={styles.articlesScrollView}
          >
            {/* Article 1: Trim, File, and Distract */}
            <TouchableOpacity 
              style={styles.articleCard}
              onPress={() => handleArticlePress('trim-file-distract')}
            >
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.7)', 'rgba(79, 70, 229, 0.5)', 'rgba(67, 56, 202, 0.6)']}
                style={styles.articleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>
                    Trim, File, and Distract
                  </Text>
                  <Text style={styles.articleSubtitle}>
                    Keep nails short and hands busy with alternatives
                  </Text>
                </View>
                <View style={styles.articleIcon}>
                  <Ionicons name="cut-outline" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Article 2: Bitter Defender & Pretty Armor */}
            <TouchableOpacity 
              style={styles.articleCard}
              onPress={() => handleArticlePress('bitter-defender-pretty-armor')}
            >
              <LinearGradient
                colors={['rgba(251, 146, 60, 0.7)', 'rgba(249, 115, 22, 0.5)', 'rgba(194, 65, 12, 0.6)']}
                style={styles.articleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>
                    Bitter Defender & Pretty Armor
                  </Text>
                  <Text style={styles.articleSubtitle}>
                    Bitter polish and attractive nail treatments
                  </Text>
                </View>
                <View style={styles.articleIcon}>
                  <Ionicons name="shield-outline" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Article 3: Mindful Awareness */}
            <TouchableOpacity 
              style={styles.articleCard}
              onPress={() => handleArticlePress('mindful-awareness')}
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.7)', 'rgba(124, 58, 237, 0.5)', 'rgba(109, 40, 217, 0.6)']}
                style={styles.articleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>
                    Mindful Awareness
                  </Text>
                  <Text style={styles.articleSubtitle}>
                    Identify triggers and redirect to healthier habits
                  </Text>
                </View>
                <View style={styles.articleIcon}>
                  <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Article 4: Rewards & Routine */}
            <TouchableOpacity 
              style={styles.articleCard}
              onPress={() => handleArticlePress('rewards-routine')}
            >
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.7)', 'rgba(5, 150, 105, 0.5)', 'rgba(4, 120, 87, 0.6)']}
                style={styles.articleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>
                    Rewards & Routine
                  </Text>
                  <Text style={styles.articleSubtitle}>
                    Start small, celebrate progress, build momentum
                  </Text>
                </View>
                <View style={styles.articleIcon}>
                  <Ionicons name="trophy-outline" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Achievement Overlay */}
      {currentOverlay && (
        <AchievementOverlay
          achievement={currentOverlay}
          isVisible={isOverlayVisible}
          onHide={hideAchievementOverlay}
        />
      )}
    </SafeAreaView>
  );
};

export default ArticlesScreen;
