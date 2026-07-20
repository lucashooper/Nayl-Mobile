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
import { useDimensions } from '../hooks/useDimensions';
import { useTheme } from '../context/ThemeContext';
import { useAchievements } from '../context/AchievementContext';
import AchievementOverlay from '../components/AchievementOverlay';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface ArticleDetailScreenProps {
  navigation: any;
  route: {
    params: {
      articleId: ArticleId;
    };
  };
}

interface Subsection {
  title: string;
  text: string;
}

interface Section {
  type: string;
  title: string;
  text: string;
  subsections?: Subsection[];
}

interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: Section[];
}

type ArticleId = 
  | 'nail-biting-psychology'
  | 'tiny-bites-big-risks'
  | 'teeth-jaws-damage'
  | 'skin-scars-lasting-impression'
  | 'self-esteem-social-snags'
  | 'cleaner-hands-sharper-health'
  | 'stronger-smile-ahead'
  | 'hands-feel-confident-again'
  | 'calmer-mind-healthier-coping'
  | 'trim-file-distract'
  | 'bitter-defender-pretty-armor'
  | 'mindful-awareness'
  | 'rewards-routine';

const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({ navigation, route }) => {
  const { width, height } = useDimensions();
  const { colors } = useTheme();
  const { checkAndUnlockAchievements, currentOverlay, isOverlayVisible, hideAchievementOverlay } = useAchievements();
  const { articleId } = route.params;

  // Track completion status
  const [isCompleted, setIsCompleted] = useState(false);

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

  // Load completion status on mount
  useEffect(() => {
    checkCompletionStatus();
  }, [articleId]);

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
    }, 20);

    return () => clearInterval(starfieldInterval);
  }, []);

  const checkCompletionStatus = async () => {
    try {
      const key = await getCompletedArticlesKey();
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const completed = new Set(JSON.parse(stored) as string[]);
        setIsCompleted(completed.has(articleId));
      }
    } catch (error) {
      console.log('Error checking completion status:', error);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMarkComplete = async () => {
    try {
      const key = await getCompletedArticlesKey();
      const stored = await AsyncStorage.getItem(key);
      let completed = new Set<string>();
      
      if (stored) {
        completed = new Set(JSON.parse(stored) as string[]);
      }
      
      if (isCompleted) {
        // Remove from completed
        completed.delete(articleId);
      } else {
        // Add to completed
        completed.add(articleId);
      }
      
      // Save updated completion status
      await AsyncStorage.setItem(key, JSON.stringify(Array.from(completed)));
      
      // Update local state
      setIsCompleted(!isCompleted);
      
      // Check for achievements based on article completion
      const totalArticlesRead = completed.size;
      checkAndUnlockAchievements({
        currentStreak: 0, // Will be updated from HomeScreen
        totalArticlesRead,
        brainRewiringProgress: 0, // Will be updated from HomeScreen
      });
      
      // Show feedback
      console.log(`Article ${isCompleted ? 'removed from' : 'marked as'} completed:`, articleId);
      
    } catch (error) {
      console.log('Error updating completion status:', error);
    }
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      zIndex: 10,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    backText: {
      ...TYPOGRAPHY.bodyMedium,
      color: colors.primaryText,
      marginLeft: SPACING.xs,
    },
    markCompleteButton: {
      backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.sm,
      borderWidth: 1,
      borderColor: isCompleted ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.2)',
      flexDirection: 'row',
      alignItems: 'center',
    },
    markCompleteText: {
      ...TYPOGRAPHY.caption,
      color: isCompleted ? colors.primaryAccent : colors.primaryText,
      fontWeight: '600',
      marginLeft: SPACING.xs,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
    },
    articleHeader: {
      alignItems: 'center',
      marginBottom: SPACING.xl,
      marginTop: SPACING.lg,
    },

    articleTitle: {
      ...TYPOGRAPHY.headingLarge,
      color: colors.primaryText,
      textAlign: 'center',
      fontWeight: '700',
      lineHeight: 40,
    },
    articleBody: {
      marginBottom: SPACING.xl,
    },
    section: {
      marginBottom: SPACING.xl,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      padding: SPACING.lg,
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    sectionTitle: {
      ...TYPOGRAPHY.headingSmall,
      color: colors.primaryText,
      fontWeight: '700',
      marginBottom: SPACING.md,
      fontSize: 20,
    },
    sectionText: {
      ...TYPOGRAPHY.bodyMedium,
      color: colors.secondaryText,
      lineHeight: 24,
      marginBottom: SPACING.md,
    },
    subsections: {
      marginTop: SPACING.md,
    },
    subsection: {
      marginBottom: SPACING.md,
      paddingLeft: SPACING.md,
      borderLeftWidth: 2,
      borderLeftColor: colors.primaryAccent,
    },
    subsectionTitle: {
      ...TYPOGRAPHY.bodyMedium,
      color: colors.primaryText,
      fontWeight: '600',
      marginBottom: SPACING.xs,
      fontSize: 16,
    },
    subsectionText: {
      ...TYPOGRAPHY.bodySmall,
      color: colors.secondaryText,
      lineHeight: 20,
    },
    bottomSpacing: {
      height: SPACING.xxxl,
    },
  });

  const styles = createStyles();

  // Article content based on the psychology article we created
  const articleContent: Record<ArticleId, Article> = {
    'nail-biting-psychology': {
      id: 'nail-biting-psychology',
      title: 'The Psychology Behind Nail Biting',
      subtitle: 'Understanding the hidden disorder and its mental health connections',
      content: [
        {
          type: 'section',
          title: 'Understanding the Hidden Disorder',
          text: 'Nail biting is often dismissed as just a bad habit, but it\'s actually a serious medical condition called onychophagia. This destructive behavior affects millions of people and can lead to serious physical and mental health problems if left untreated.',
        },
        {
          type: 'section',
          title: 'What Makes Nail Biting a Medical Condition?',
          text: 'Nail biting isn\'t just about aesthetics—it\'s classified as a body-focused repetitive behavior (BFRB) in the DSM-5, placing it alongside other pathological grooming disorders like skin picking. Research shows that up to one in three people meet clinical criteria for pathological grooming behaviors, making it more common than depression, anxiety, and alcohol abuse combined.',
        },
        {
          type: 'section',
          title: 'Who\'s Most Affected?',
          text: 'The numbers are striking:\n• 20-33% of children engage in nail biting\n• 45% of teenagers struggle with this behavior\n• While many outgrow it, some continue into adulthood',
        },
        {
          type: 'section',
          title: 'The Psychology Behind the Behavior',
          text: 'Nail biting serves as a coping mechanism for various psychological needs:',
          subsections: [
            {
              title: '🧠 Stress Relief',
              text: 'Provides temporary calming effect on the nervous system and acts as a self-soothing behavior during anxiety.',
            },
            {
              title: '😔 Emotional Regulation',
              text: 'Helps manage feelings of shyness and low self-esteem, and serves as a response to traumatic life events.',
            },
            {
              title: '⚡ Perfectionist Tendencies',
              text: 'Associated with low boredom tolerance and provides relief from frustration and perfectionist pressure.',
            },
            {
              title: '🎯 Attention and Control',
              text: 'Can be attention-seeking behavior, helps control aggression, and is part of the obsessive-compulsive disorder spectrum.',
            },
          ],
        },
        {
          type: 'section',
          title: 'Mental Health Connections',
          text: 'Nail biting is strongly linked to several psychiatric conditions:\n• Attention Deficit Hyperactivity Disorder (ADHD)\n• Oppositional Defiant Disorder\n• Separation Anxiety Disorder\n• Major Depressive Disorder\n• Generalized Anxiety Disorder',
        },
        {
          type: 'section',
          title: 'Breaking the Cycle',
          text: 'The key to overcoming nail biting lies in understanding that admonishment doesn\'t work. Instead, effective treatment involves:\n\n1. Positive reinforcement techniques\n2. Behavioral modification strategies\n3. Professional support for underlying mental health conditions\n4. Awareness and education about the disorder\'s impact',
        },
        {
          type: 'section',
          title: 'The Path Forward',
          text: 'Recognizing nail biting as a legitimate medical condition is the first step toward recovery. With proper understanding and treatment, millions of people can break free from this distressing behavior and improve their overall mental health and well-being.',
        },
      ],
    },
    'tiny-bites-big-risks': {
      id: 'tiny-bites-big-risks',
      title: 'Tiny Bites, Big Risks',
      subtitle: 'Germs, infections, and bloodstream concerns from nail biting',
      content: [
        {
          type: 'section',
          title: 'The Germ Gateway',
          text: 'Biting your nails isn\'t just a fidget—it can crack the door for germs to enter. Everyday surfaces host bacteria under our nails, and when you bite them, you invite those germs right into your mouth. Illnesses from the common cold to stomach bugs can follow.',
        },
        {
          type: 'section',
          title: 'Infection Risks',
          text: 'Chipped skin and cuticles aren\'t just unsightly—they\'re gateways for painful nail-bed infections (paronychia) or even deeper concerns. And yes, it can reach your bloodstream.',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'The Times of India\nHarvard Health\ntrinkner.com',
        },
      ],
    },
    'teeth-jaws-damage': {
      id: 'teeth-jaws-damage',
      title: 'Teeth and Jaws Aren\'t Safe Either',
      subtitle: 'Enamel damage, cracked teeth, and jaw alignment problems',
      content: [
        {
          type: 'section',
          title: 'Dental Damage',
          text: 'Your nails make for a temptation your teeth can\'t handle—literally. Nail biting can wear down enamel, chip or crack teeth, and even cause jaw pain or alignment problems over time.',
        },
        {
          type: 'section',
          title: 'The Cost of the Clash',
          text: 'A costly clash between your teeth and nails isn\'t worth it. The damage can lead to expensive dental procedures and long-term oral health issues.',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'The Times of India\nTIME\nhackensackmeridianhealth.org\ntrinkner.com',
        },
      ],
    },
    'skin-scars-lasting-impression': {
      id: 'skin-scars-lasting-impression',
      title: 'Skin and Scars—A Lasting Impression',
      subtitle: 'Hangnails, bleeding skin, and permanent nail damage',
      content: [
        {
          type: 'section',
          title: 'Physical Damage',
          text: 'Constant biting can lead to persistent hangnails, bleeding skin, and even scarred cuticles. Over time, this repeated damage might permanently alter how your nails grow or make fingertips particularly sensitive.',
        },
        {
          type: 'section',
          title: 'More Than a Habit',
          text: 'It\'s more than a habit—it\'s physical harm. The damage can be both immediate and long-lasting, affecting your nail health for years to come.',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'Wikipedia\ntrinkner.com\nalexanderdentistry.com',
        },
      ],
    },
    'self-esteem-social-snags': {
      id: 'self-esteem-social-snags',
      title: 'Self-Esteem and Social Snags',
      subtitle: 'Confidence issues and social interaction challenges',
      content: [
        {
          type: 'section',
          title: 'Confidence Impact',
          text: 'Downplayed or ignored, this habit can chip away at confidence. You\'re more likely to hide your hands during social interactions, or feel awkward before handshakes or meetings.',
        },
        {
          type: 'section',
          title: 'The Spiral Effect',
          text: 'That low-level embarrassment can spiral into avoidance or internal shame. It affects not just how others see you, but how you see yourself.',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'Wikipedia\nHergott Dental Associates\ntrinkner.com',
        },
      ],
    },
    // Quitting Benefits Articles
    'cleaner-hands-sharper-health': {
      id: 'cleaner-hands-sharper-health',
      title: 'Cleaner Hands, Sharper Health',
      subtitle: 'Fewer colds, less throat irritation, and stronger immunity',
      content: [
        {
          type: 'section',
          title: 'The Health Transformation',
          text: 'By halting nail biting, you\'re blocking germs from entering your system. This simple change can lead to fewer colds, less throat irritation, and fewer infections overall.',
        },
        {
          type: 'section',
          title: 'Immune System Boost',
          text: 'Your immune system will appreciate the break! With fewer germs entering through your mouth, your body can focus on fighting off other threats more effectively.',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'The Times of India\nbannerhealth.com\ntrinkner.com',
        },
      ],
    },
    'stronger-smile-ahead': {
      id: 'stronger-smile-ahead',
      title: 'Stronger Smile Ahead',
      subtitle: 'Preserved enamel, stronger teeth, and jaw relief',
      content: [
        {
          type: 'section',
          title: 'Dental Protection',
          text: 'No more chipping or wearing down your teeth. Letting your nails grow naturally spares enamel and relieves your jaw.',
        },
        {
          type: 'section',
          title: 'Long-term Benefits',
          text: 'Over time, you\'ll save your smile—and maybe avoid dental visits tied to damage. Your teeth will thank you for the break.',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'The Times of India\nhackensackmeridianhealth.org\ntrinkner.com',
        },
      ],
    },
    'hands-feel-confident-again': {
      id: 'hands-feel-confident-again',
      title: 'Hands That Feel Confident Again',
      subtitle: 'Boosted self-image and reduced social anxiety',
      content: [
        {
          type: 'section',
          title: 'Confidence Restoration',
          text: 'Imagine showing your hands without hesitation—no ragged edges or red skin. Healthy-looking nails can boost self-image and ease social anxiety.',
        },
        {
          type: 'section',
          title: 'Pride in Your Hands',
          text: 'You\'ll think, "These are MY hands—and I\'m proud of them." Confidence regained, one healthy nail at a time.',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'Hergott Dental Associates\ntrinkner.com',
        },
      ],
    },
    'calmer-mind-healthier-coping': {
      id: 'calmer-mind-healthier-coping',
      title: 'Calmer Mind, Healthier Coping',
      subtitle: 'Better stress habits and purposeful anxiety management',
      content: [
        {
          type: 'section',
          title: 'Building Better Habits',
          text: 'Quitting builds better stress habits. Replacing nail biting with purposeful actions—like tapping, stretching, or focusing on serenity—reshapes how you handle anxiety.',
        },
        {
          type: 'section',
          title: 'Learning to Cope',
          text: 'You\'ll learn to cope, not quiver. The journey from nail biting to healthy coping mechanisms is transformative.',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'Bingham Farms Dentist\nPMC\nByrdie',
        },
      ],
    },
    // Recovery Strategies Articles
    'trim-file-distract': {
      id: 'trim-file-distract',
      title: 'Trim, File, and Distract',
      subtitle: 'Keep nails short and hands busy with alternatives',
      content: [
        {
          type: 'section',
          title: 'The Three-Pronged Approach',
          text: 'Keep nails short—less to bite means less temptation. Carry a file for sudden urges or ragged bits.',
        },
        {
          type: 'section',
          title: 'Stay Busy, Stay Safe',
          text: 'And when the urge hits, reach for a stress ball or fidget tool. Your hands stay busy, your nails stay safe.',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'aad.org\nByrdie\nReddit',
        },
      ],
    },
    'bitter-defender-pretty-armor': {
      id: 'bitter-defender-pretty-armor',
      title: 'Bitter Defender & Pretty Armor',
      subtitle: 'Bitter polish and attractive nail treatments',
      content: [
        {
          type: 'section',
          title: 'The Bitter Truth',
          text: 'Apply a bitter nail polish to deter biting; the unpleasant taste reminds you to stop.',
        },
        {
          type: 'section',
          title: 'Beauty as Motivation',
          text: 'Pair it with painted nails or nail wraps that look neat—lovely visuals = less temptation.',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'aad.org\nByrdie\nGlamour',
        },
      ],
    },
    'mindful-awareness': {
      id: 'mindful-awareness',
      title: 'Mindful Awareness',
      subtitle: 'Identify triggers and redirect to healthier habits',
      content: [
        {
          type: 'section',
          title: 'The Power of Pause',
          text: 'Pause and ask: Why am I doing this now? Awareness is power. Pause, name your trigger—stress? boredom?',
        },
        {
          type: 'section',
          title: 'Redirecting the Habit',
          text: 'Then steer the habit toward something healthier, like doodling or breathing. Every moment of awareness is progress.',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'SELF\nPMC\nByrdie',
        },
      ],
    },
    'rewards-routine': {
      id: 'rewards-routine',
      title: 'Rewards & Routine',
      subtitle: 'Start small, celebrate progress, build momentum',
      content: [
        {
          type: 'section',
          title: 'Start Small, Think Big',
          text: 'Start small: pick one nail to protect first, then slowly expand. Building positive momentum helps keep the habit gone.',
        },
        {
          type: 'section',
          title: 'Celebrate Your Progress',
          text: 'Celebrate with tiny rewards—your favorite treat, extra self-care, or a mini manicure. Every small victory counts! 🏅',
        },
        {
          type: 'section',
          title: 'Sources',
          text: 'aad.org\nPMC\nGlamour',
        },
      ],
    },
  };

  const currentArticle = articleContent[articleId] || articleContent['nail-biting-psychology'];

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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.markCompleteButton} onPress={handleMarkComplete}>
          <Ionicons 
            name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"} 
            size={20} 
            color={isCompleted ? colors.primaryAccent : colors.primaryText} 
          />
          <Text style={styles.markCompleteText}>
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Article Header */}
        <View style={styles.articleHeader}>
          <Text style={styles.articleTitle}>{currentArticle.title}</Text>
        </View>

        {/* Article Body */}
        <View style={styles.articleBody}>
          {currentArticle.content.map((section: Section, index: number) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionText}>{section.text}</Text>
              
              {section.subsections && (
                <View style={styles.subsections}>
                  {section.subsections.map((subsection: Subsection, subIndex: number) => (
                    <View key={subIndex} style={styles.subsection}>
                      <Text style={styles.subsectionTitle}>{subsection.title}</Text>
                      <Text style={styles.subsectionText}>{subsection.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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

export default ArticleDetailScreen;
