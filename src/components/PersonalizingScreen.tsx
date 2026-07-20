import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface PersonalizingScreenProps {
  userName: string;
  onComplete: () => void;
}

const PersonalizingScreen: React.FC<PersonalizingScreenProps> = ({ userName, onComplete }) => {
  const [showPersonalizedMessage, setShowPersonalizedMessage] = useState(false);
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Shared values for animations
  const percentageAnim = useSharedValue(0);
  const textOpacity = useSharedValue(1);
  const textTranslateY = useSharedValue(0);
  const personalizedMessageOpacity = useSharedValue(0);
  const personalizedMessageTranslateY = useSharedValue(20);

  // Sequence of messages
  const messages = [
    "Personalizing...",
    "Evaluating your answers...",
    "Crafting the perfect plan...",
    "Building your personalized plan..."
  ];

  // Starfield data - subtle blue/purple gradient stars
  const starfieldData = useMemo(() => [
    { id: 1, top: '15%', left: '20%', size: 'large', opacity: 0.4 },
    { id: 2, top: '25%', right: '30%', size: 'small', opacity: 0.3 },
    { id: 3, top: '40%', left: '10%', size: 'medium', opacity: 0.5 },
    { id: 4, top: '60%', right: '15%', size: 'large', opacity: 0.4 },
    { id: 5, top: '75%', left: '40%', size: 'small', opacity: 0.3 },
    { id: 6, top: '85%', right: '25%', size: 'medium', opacity: 0.4 },
    { id: 7, top: '35%', left: '70%', size: 'small', opacity: 0.3 },
    { id: 8, top: '50%', right: '60%', size: 'large', opacity: 0.5 },
    { id: 9, top: '20%', left: '50%', size: 'medium', opacity: 0.4 },
    { id: 10, top: '70%', left: '80%', size: 'small', opacity: 0.3 },
    { id: 11, top: '10%', left: '15%', size: 'large', opacity: 0.4 },
    { id: 12, top: '25%', right: '20%', size: 'small', opacity: 0.3 },
    { id: 13, top: '45%', left: '25%', size: 'medium', opacity: 0.5 },
    { id: 14, top: '65%', right: '30%', size: 'large', opacity: 0.4 },
    { id: 15, top: '80%', left: '35%', size: 'small', opacity: 0.3 },
    { id: 16, top: '30%', left: '80%', size: 'medium', opacity: 0.4 },
    { id: 17, top: '55%', right: '70%', size: 'large', opacity: 0.5 },
    { id: 18, top: '15%', right: '40%', size: 'small', opacity: 0.3 },
    { id: 19, top: '75%', right: '10%', size: 'medium', opacity: 0.4 },
    { id: 20, top: '40%', left: '60%', size: 'large', opacity: 0.5 },
    { id: 21, top: '20%', left: '25%', size: 'medium', opacity: 0.4 },
    { id: 22, top: '35%', right: '35%', size: 'small', opacity: 0.3 },
    { id: 23, top: '50%', left: '15%', size: 'large', opacity: 0.5 },
    { id: 24, top: '70%', right: '25%', size: 'medium', opacity: 0.4 },
    { id: 25, top: '85%', left: '45%', size: 'small', opacity: 0.3 },
    { id: 26, top: '25%', left: '75%', size: 'large', opacity: 0.5 },
    { id: 27, top: '60%', right: '60%', size: 'medium', opacity: 0.4 },
    { id: 28, top: '10%', right: '15%', size: 'small', opacity: 0.3 },
    { id: 29, top: '45%', left: '85%', size: 'large', opacity: 0.5 },
    { id: 30, top: '90%', right: '45%', size: 'medium', opacity: 0.4 },
    { id: 31, top: '18%', left: '30%', size: 'large', opacity: 0.5 },
    { id: 32, top: '32%', right: '40%', size: 'small', opacity: 0.3 },
    { id: 33, top: '48%', left: '20%', size: 'medium', opacity: 0.4 },
    { id: 34, top: '68%', right: '30%', size: 'large', opacity: 0.5 },
    { id: 35, top: '78%', left: '50%', size: 'small', opacity: 0.3 },
    { id: 36, top: '22%', left: '70%', size: 'medium', opacity: 0.4 },
    { id: 37, top: '58%', right: '70%', size: 'large', opacity: 0.5 },
    { id: 38, top: '12%', right: '25%', size: 'small', opacity: 0.3 },
    { id: 39, top: '42%', left: '80%', size: 'medium', opacity: 0.4 },
    { id: 40, top: '88%', right: '20%', size: 'large', opacity: 0.5 },
    { id: 41, top: '5%', left: '45%', size: 'small', opacity: 0.3 },
    { id: 42, top: '55%', right: '10%', size: 'medium', opacity: 0.4 },
    { id: 43, top: '95%', left: '35%', size: 'large', opacity: 0.5 },
    { id: 44, top: '15%', right: '55%', size: 'small', opacity: 0.3 },
    { id: 45, top: '65%', left: '90%', size: 'medium', opacity: 0.4 },
    { id: 46, top: '25%', left: '5%', size: 'large', opacity: 0.5 },
    { id: 47, top: '75%', right: '80%', size: 'small', opacity: 0.3 },
    { id: 48, top: '35%', left: '95%', size: 'medium', opacity: 0.4 },
    { id: 49, top: '85%', right: '5%', size: 'large', opacity: 0.5 },
    { id: 50, top: '45%', left: '65%', size: 'small', opacity: 0.3 },
  ], []);

  // Function to convert star data to styles
  const getStarStyle = (star: any) => {
    const baseStyle: any = {
      position: 'absolute' as const,
      opacity: star.opacity,
      backgroundColor: 'rgba(147, 51, 234, 0.8)', // Blue/purple background
      shadowColor: 'rgba(147, 51, 234, 0.6)', // Blue/purple shadow
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 1,
      elevation: 2,
    };

    // Add positioning
    if (star.top) baseStyle.top = star.top;
    if (star.left) baseStyle.left = star.left;
    if (star.right) baseStyle.right = star.right;

    // Add size based on star.size
    switch (star.size) {
      case 'small':
        return {
          ...baseStyle,
          width: 1,
          height: 1,
          borderRadius: 0.5,
        };
      case 'medium':
        return {
          ...baseStyle,
          width: 1.5,
          height: 1.5,
          borderRadius: 0.75,
        };
      case 'large':
        return {
          ...baseStyle,
          width: 2,
          height: 2,
          borderRadius: 1,
        };
      default:
        return {
          ...baseStyle,
          width: 1.5,
          height: 1.5,
          borderRadius: 0.75,
        };
    }
  };

  // Start the animation sequence
  useEffect(() => {
    let isMounted = true;
    
    // Reset all values
    percentageAnim.value = 0;
    setCurrentPercentage(0);
    setCurrentMessageIndex(0);
    setShowPersonalizedMessage(false);
    setAnimationComplete(false);
    textOpacity.value = 1;
    textTranslateY.value = 0;
    personalizedMessageOpacity.value = 0;
    personalizedMessageTranslateY.value = 20;

    // Start percentage animation with premium easing
    percentageAnim.value = withTiming(100, {
      duration: 8000,
      easing: Easing.out(Easing.back(1.2)), // More premium easing curve
    }, (finished) => {
      if (finished && isMounted) {
        runOnJS(setAnimationComplete)(true);
        runOnJS(setShowPersonalizedMessage)(true);
        
        personalizedMessageOpacity.value = withTiming(1, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        });
        personalizedMessageTranslateY.value = withTiming(0, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

    // Smooth percentage display with consistent updates
    const percentageInterval = setInterval(() => {
      if (!isMounted) return;
      
      const currentPercent = Math.round(percentageAnim.value);
      setCurrentPercentage(currentPercent);
      
      // Stop the interval if animation is complete
      if (currentPercent >= 100) {
        clearInterval(percentageInterval);
      }
    }, 50); // Faster, consistent updates for smoother feel

    // Separate timer for text sequence - controlled and predictable
    const textSequenceTimer = setTimeout(() => {
      if (isMounted && !animationComplete) {
        // Message 1 at 2 seconds (25% of 8 seconds)
        setTimeout(() => {
          if (isMounted && !animationComplete) {
            runOnJS(setCurrentMessageIndex)(1);
            // Fade out current message
            textOpacity.value = withTiming(0, {
              duration: 300,
              easing: Easing.out(Easing.cubic),
            }, () => {
              if (isMounted && !animationComplete) {
                textOpacity.value = withTiming(1, {
                  duration: 400,
                  easing: Easing.out(Easing.cubic),
                });
              }
            });
          }
        }, 2000);

        // Message 2 at 4 seconds (50% of 8 seconds)
        setTimeout(() => {
          if (isMounted && !animationComplete) {
            runOnJS(setCurrentMessageIndex)(2);
            textOpacity.value = withTiming(0, {
              duration: 300,
              easing: Easing.out(Easing.cubic),
            }, () => {
              if (isMounted && !animationComplete) {
                textOpacity.value = withTiming(1, {
                  duration: 400,
                  easing: Easing.out(Easing.cubic),
                });
              }
            });
          }
        }, 4000);

        // Message 3 at 6 seconds (75% of 8 seconds)
        setTimeout(() => {
          if (isMounted && !animationComplete) {
            runOnJS(setCurrentMessageIndex)(3);
            textOpacity.value = withTiming(0, {
              duration: 300,
              easing: Easing.out(Easing.cubic),
            }, () => {
              if (isMounted && !animationComplete) {
                textOpacity.value = withTiming(1, {
                  duration: 400,
                  easing: Easing.out(Easing.cubic),
                });
              }
            });
          }
        }, 6000);
      }
    }, 100);

    return () => {
      isMounted = false;
      clearInterval(percentageInterval);
      clearTimeout(textSequenceTimer);
    };
  }, []); // Empty dependency array to run only once

  // Effect to handle animation completion
  useEffect(() => {
    if (animationComplete) {
      // Stop all text animations when complete
      textOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [animationComplete]);

  // Animated styles - NO shared value access during render
  const messageStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const personalizedMessageStyle = useAnimatedStyle(() => ({
    opacity: personalizedMessageOpacity.value,
    transform: [{ translateY: personalizedMessageTranslateY.value }],
  }));

  const percentageStyle = useAnimatedStyle(() => ({
    opacity: showPersonalizedMessage ? 0 : 1,
    transform: [
      { 
        scale: 1 + (percentageAnim.value / 100) * 0.15 // Slightly more scale for premium feel
      },
      { 
        translateY: (percentageAnim.value / 100) * -5 // Subtle upward movement as it progresses
      }
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Background removed - using pure black container background */}
      
      {/* Starfield */}
      {starfieldData.map((star, index) => (
        <View
          key={star.id}
          style={[
            styles.star,
            getStarStyle(star),
          ]}
        />
      ))}

      {/* Content */}
      <View style={styles.content}>
        {/* Loading Message */}
        <Animated.Text style={[styles.loadingText, messageStyle]}>
          {!showPersonalizedMessage && !animationComplete ? messages[currentMessageIndex] : ""}
        </Animated.Text>

        {/* Percentage */}
        <Animated.Text style={[styles.percentageText, percentageStyle]}>
          {currentPercentage}%
        </Animated.Text>

        {/* Final Message */}
        <Animated.View style={[styles.personalizedMessageContainer, personalizedMessageStyle]}>
          <Text style={styles.personalizedMessage}>
            {userName}, your assessment is complete
          </Text>
          <Text style={styles.personalizedSubtitle}>
            Some good news...
          </Text>
          <Text style={styles.personalizedSubtitle}>
            Some not so great news...
          </Text>
          
          <TouchableOpacity
            style={styles.continueButton}
            onPress={onComplete}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Nail Icon */}
      <View style={styles.nailIconContainer}>
        <Image
          source={require('../../assets/cosmic-nail-nobg.webp')}
          style={styles.nailIcon}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure black to match other onboarding screens
  },
  // Background style removed - no longer needed
  star: {
    position: 'absolute',
    // Star styles are now handled by getStarStyle function
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: height * 0.15, // Add top padding to prevent text cutoff
    paddingBottom: height * 0.4, // Reserve space for nail icon
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  percentageText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -2,
    // Enhanced premium styling
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  personalizedMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: width * 0.8,
    marginTop: -height * 0.1, // Move text higher up to better balance the layout
  },
  personalizedMessage: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  personalizedSubtitle: {
    fontSize: 22,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  continueButton: {
    marginTop: 40,
    width: width * 0.7,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  continueButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nailIconContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    zIndex: 10,
  },
  nailIcon: {
    width: '100%',
    height: '100%',
    maxWidth: width * 0.8,
    opacity: 0.8,
  },
});

export default PersonalizingScreen;
