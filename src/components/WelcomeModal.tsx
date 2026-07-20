import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { FONT_FAMILY } from '../constants/fonts';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';

const { width } = Dimensions.get('window');

interface WelcomeModalProps {
  visible: boolean;
  userName: string;
  onContinue: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, userName, onContinue }) => {
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.92);
  const cardOpacity = useSharedValue(0);
  const titleY = useSharedValue(24);
  const bodyY = useSharedValue(16);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 400 });
      cardOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
      cardScale.value = withDelay(100, withSpring(1, { damping: 14, stiffness: 120 }));
      titleY.value = withDelay(200, withSpring(0, { damping: 16, stiffness: 140 }));
      bodyY.value = withDelay(320, withSpring(0, { damping: 16, stiffness: 140 }));
    } else {
      overlayOpacity.value = 0;
      cardScale.value = 0.92;
      cardOpacity.value = 0;
      titleY.value = 24;
      bodyY.value = 16;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bodyY.value }],
  }));

  const displayName = userName.trim() || 'there';

  const handleContinue = () => {
    hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
    onContinue();
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.15)', 'rgba(0, 0, 0, 0.85)', 'rgba(0, 0, 0, 0.95)']}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View style={[styles.card, cardStyle]}>
          <LinearGradient
            colors={['rgba(124, 58, 237, 0.2)', 'rgba(15, 15, 15, 0.98)', '#0A0A0A']}
            style={styles.cardGradient}
          >
            <View style={styles.logoGlow}>
              <Image
                source={require('../../assets/onboarding-icons/Nayl-cooler-logo.webp')}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>

            <Animated.View style={titleStyle}>
              <Text style={styles.welcomeLabel}>Welcome to Nayl</Text>
              <Text style={styles.nameText}>{displayName}</Text>
            </Animated.View>

            <Animated.View style={bodyStyle}>
              <Text style={styles.message}>
                You've taken the first step toward healthier nails and more control. We're here for every milestone along the way.
              </Text>
            </Animated.View>

            <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.9}>
              <LinearGradient
                colors={['#7C3AED', '#DB2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Let's begin</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 20,
  },
  cardGradient: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
  },
  logoGlow: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 20,
  },
  welcomeLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  nameText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  message: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default WelcomeModal;
