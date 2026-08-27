import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { VideoView } from 'expo-video';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useMeditation } from '../context/MeditationContext';
import StarfieldBackground from '../components/StarfieldBackground';

const { width } = Dimensions.get('window');

const motivationalQuotes = [
  "Remember, you've overcome so much already.",
  "This is just one more step on your journey.",
  "Every moment of resistance builds your strength.",
  "You are stronger than any urge.",
  "Your future self will thank you for this.",
  "Each day without biting is a victory.",
  "You have the power to change your habits.",
  "Breathe through the discomfort.",
  "Your hands are healing, your mind is growing.",
  "This moment of mindfulness will pass.",
  "You are building a better version of yourself.",
  "Trust the process, trust yourself.",
  "Every breath brings you closer to freedom.",
  "You've got this, one breath at a time.",
  "Your determination is inspiring.",
];

interface MeditationScreenProps {
  navigation: any;
}

const MeditationScreen: React.FC<MeditationScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const videoOpacityAnim = useRef(new Animated.Value(0)).current;

  const {
    setIsMeditationActive,
    meditationPlayer: player,
    isMeditationVideoReady: videoReady,
    meditationVideoFailed: videoFailed,
  } = useMeditation();
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!videoReady) return;

    Animated.timing(videoOpacityAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [videoReady, videoOpacityAnim]);

  useFocusEffect(
    React.useCallback(() => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }

      setIsMeditationActive(true);

      if (!videoFailed) {
        player.loop = true;
        player.muted = true;
        player.play();
      }

      const startOpeningAnimation = () => {
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: 0,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      };

      const animationTimer = setTimeout(startOpeningAnimation, 150);

      return () => {
        exitTimerRef.current = setTimeout(() => {
          setIsMeditationActive(false);
          player.pause();
          exitTimerRef.current = null;
        }, 320);
        clearTimeout(animationTimer);
      };
    }, [setIsMeditationActive, player, videoFailed, opacityAnim, scaleAnim, translateYAnim, fadeAnim]),
  );

  useEffect(() => {
    scaleAnim.setValue(0.8);
    opacityAnim.setValue(0);
    translateYAnim.setValue(30);
    fadeAnim.setValue(0);
  }, [scaleAnim, opacityAnim, translateYAnim, fadeAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleFinishReflecting = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.baseBackground} />

      <StarfieldBackground starCount={45} style={styles.starfield} />

      {!videoFailed && (
        <Animated.View style={[styles.backgroundVideo, { opacity: videoOpacityAnim }]}>
          <VideoView
            style={StyleSheet.absoluteFillObject}
            player={player}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
          />
        </Animated.View>
      )}

      <View style={styles.overlay} />

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          },
        ]}
      >
        <Animated.View style={[styles.circularShape, { opacity: fadeAnim }]}>
          <View style={styles.circularInner}>
            <Text style={styles.reflectText}>REFLECT AND BREATHE</Text>
            <Text style={styles.motivationalText}>
              {motivationalQuotes[currentQuoteIndex]}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            bottom: Math.max(insets.bottom + SPACING.lg, SPACING.xxl),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishReflecting}
          activeOpacity={0.8}
        >
          <Text style={styles.finishButtonText}>Finish Reflecting</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  baseBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 0,
  },
  starfield: {
    zIndex: 1,
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 3,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    zIndex: 4,
  },
  circularShape: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    marginBottom: SPACING.xxxl,
    overflow: 'hidden',
  },
  circularInner: {
    flex: 1,
    borderRadius: (width * 0.8) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  reflectText: {
    ...TYPOGRAPHY.caption,
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.xl,
    textAlign: 'center',
    letterSpacing: 1,
  },
  motivationalText: {
    ...TYPOGRAPHY.headingMedium,
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primaryText,
    textAlign: 'center',
    lineHeight: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  finishButton: {
    width: width * 0.6,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.button,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishButtonText: {
    ...TYPOGRAPHY.buttonText,
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 5,
  },
});

export default MeditationScreen;
