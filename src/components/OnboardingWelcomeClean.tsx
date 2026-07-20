import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';

const { width, height } = Dimensions.get('window');

interface OnboardingWelcomeProps {
  onStart: () => void;
  onSkip: () => void;
}

const OnboardingWelcomeClean: React.FC<OnboardingWelcomeProps> = ({ onStart, onSkip }) => {
  const handleStart = () => {
    hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
    onStart();
  };

  const handleSkip = () => {
    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
    onSkip();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Background with starfield */}
      <LinearGradient
        colors={['rgba(4, 11, 37, 0.98)', 'rgba(1, 2, 8, 0.99)', 'rgb(0, 6, 22)']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* Subtle Starfield Background */}
      <View style={styles.starsContainer}>
        <View style={[styles.star, styles.star1]} />
        <View style={[styles.star, styles.star2]} />
        <View style={[styles.star, styles.star3]} />
        <View style={[styles.star, styles.star4]} />
        <View style={[styles.star, styles.star5]} />
        <View style={[styles.star, styles.star6]} />
        <View style={[styles.star, styles.star7]} />
        <View style={[styles.star, styles.star8]} />
        <View style={[styles.star, styles.star9]} />
        <View style={[styles.star, styles.star10]} />
        <View style={[styles.star, styles.star11]} />
        <View style={[styles.star, styles.star12]} />
        <View style={[styles.star, styles.star13]} />
        <View style={[styles.star, styles.star14]} />
        <View style={[styles.star, styles.star15]} />
        <View style={[styles.star, styles.star16]} />
        <View style={[styles.star, styles.star17]} />
        <View style={[styles.star, styles.star18]} />
        <View style={[styles.star, styles.star19]} />
        <View style={[styles.star, styles.star20]} />
        <View style={[styles.star, styles.star21]} />
        <View style={[styles.star, styles.star22]} />
        <View style={[styles.star, styles.star23]} />
        <View style={[styles.star, styles.star24]} />
        <View style={[styles.star, styles.star25]} />
        <View style={[styles.star, styles.star26]} />
        <View style={[styles.star, styles.star27]} />
        <View style={[styles.star, styles.star28]} />
        <View style={[styles.star, styles.star29]} />
        <View style={[styles.star, styles.star30]} />
        <View style={[styles.star, styles.star31]} />
        <View style={[styles.star, styles.star32]} />
        <View style={[styles.star, styles.star33]} />
        <View style={[styles.star, styles.star34]} />
        <View style={[styles.star, styles.star35]} />
        <View style={[styles.star, styles.star36]} />
        <View style={[styles.star, styles.star37]} />
        <View style={[styles.star, styles.star38]} />
        <View style={[styles.star, styles.star39]} />
        <View style={[styles.star, styles.star40]} />
        <View style={[styles.star, styles.star41]} />
        <View style={[styles.star, styles.star42]} />
        <View style={[styles.star, styles.star43]} />
        <View style={[styles.star, styles.star44]} />
        <View style={[styles.star, styles.star45]} />
        <View style={[styles.star, styles.star46]} />
        <View style={[styles.star, styles.star47]} />
        <View style={[styles.star, styles.star48]} />
        <View style={[styles.star, styles.star49]} />
        <View style={[styles.star, styles.star50]} />
      </View>

      {/* Top Section - Welcome Text */}
      <View style={styles.topSection}>
        <Text style={styles.welcomeTitle}>Welcome</Text>
        <Text style={styles.welcomeSubtitle}>to Nayl</Text>
        <Text style={styles.tagline}>
          Break free from nail biting.{'\n'}Regain control over your life.
        </Text>
      </View>

      {/* Middle Section - Call-to-Action Buttons */}
      <View style={styles.middleSection}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
          <LinearGradient
            colors={['rgb(30, 64, 175)', 'rgb(30, 58, 138)', 'rgb(30, 58, 138)']}
            style={styles.primaryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryButtonText}>Start my journey</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
          <Text style={styles.secondaryButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Section - Main App Icon */}
      <View style={styles.bottomSection}>
        <Image 
          source={require('../../assets/onboarding-icons/Nayl-cooler-logo.webp')}
          style={styles.appIcon}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

// CSS-like styling with clear organization
const styles = StyleSheet.create({
  // Layout & Container
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Background Elements
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: 'hidden',
  },
  
  star: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1.0,
    shadowRadius: 6,
  },
  star1: {
    top: '15%',
    left: '20%',
    opacity: 0.8,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star2: {
    top: '25%',
    right: '30%',
    opacity: 0.9,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star3: {
    top: '40%',
    left: '10%',
    opacity: 0.7,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star4: {
    top: '60%',
    right: '15%',
    opacity: 0.8,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star5: {
    top: '75%',
    left: '40%',
    opacity: 0.9,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star6: {
    top: '85%',
    right: '25%',
    opacity: 0.7,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star7: {
    top: '35%',
    left: '70%',
    opacity: 0.8,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star8: {
    top: '50%',
    right: '60%',
    opacity: 0.6,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star9: {
    top: '20%',
    left: '50%',
    opacity: 0.9,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star10: {
    top: '70%',
    left: '80%',
    opacity: 0.7,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star11: {
    top: '30%',
    left: '85%',
    opacity: 0.8,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star12: {
    top: '80%',
    left: '25%',
    opacity: 0.6,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star13: {
    top: '10%',
    left: '10%',
    opacity: 0.8,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star14: {
    top: '20%',
    right: '20%',
    opacity: 0.9,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star15: {
    top: '40%',
    left: '30%',
    opacity: 0.7,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star16: {
    top: '60%',
    right: '30%',
    opacity: 0.8,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star17: {
    top: '80%',
    left: '40%',
    opacity: 0.9,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star18: {
    top: '90%',
    right: '40%',
    opacity: 0.7,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star19: {
    top: '5%',
    left: '60%',
    opacity: 0.8,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star20: {
    top: '15%',
    right: '10%',
    opacity: 0.9,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star21: {
    top: '25%',
    left: '80%',
    opacity: 0.7,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star22: {
    top: '45%',
    right: '5%',
    opacity: 0.8,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star23: {
    top: '55%',
    left: '90%',
    opacity: 0.9,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star24: {
    top: '65%',
    right: '45%',
    opacity: 0.7,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star25: {
    top: '75%',
    left: '5%',
    opacity: 0.8,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star26: {
    top: '85%',
    right: '70%',
    opacity: 0.9,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star27: {
    top: '95%',
    left: '70%',
    opacity: 0.7,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star28: {
    top: '8%',
    left: '40%',
    opacity: 0.8,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star29: {
    top: '18%',
    right: '50%',
    opacity: 0.9,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star30: {
    top: '28%',
    left: '15%',
    opacity: 0.7,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star31: {
    top: '38%',
    right: '80%',
    opacity: 0.8,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star32: {
    top: '48%',
    left: '75%',
    opacity: 0.9,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star33: {
    top: '58%',
    right: '15%',
    opacity: 0.7,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star34: {
    top: '68%',
    left: '55%',
    opacity: 0.8,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star35: {
    top: '78%',
    right: '90%',
    opacity: 0.9,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star36: {
    top: '88%',
    left: '25%',
    opacity: 0.7,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star37: {
    top: '12%',
    left: '85%',
    opacity: 0.8,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star38: {
    top: '22%',
    right: '25%',
    opacity: 0.9,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star39: {
    top: '32%',
    left: '45%',
    opacity: 0.7,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star40: {
    top: '42%',
    right: '60%',
    opacity: 0.8,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star41: {
    top: '52%',
    left: '20%',
    opacity: 0.9,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star42: {
    top: '62%',
    right: '75%',
    opacity: 0.7,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star43: {
    top: '72%',
    left: '65%',
    opacity: 0.8,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star44: {
    top: '82%',
    right: '35%',
    opacity: 0.9,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star45: {
    top: '92%',
    left: '35%',
    opacity: 0.7,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  star46: {
    top: '7%',
    left: '30%',
    opacity: 0.8,
    backgroundColor: 'rgba(139, 92, 246, 1.0)',
    shadowColor: '#8B5CF6',
  },
  star47: {
    top: '17%',
    right: '40%',
    opacity: 0.9,
    backgroundColor: 'rgba(96, 165, 250, 1.0)',
    shadowColor: '#60A5FA',
  },
  star48: {
    top: '27%',
    left: '95%',
    opacity: 0.7,
    backgroundColor: 'rgba(168, 85, 247, 1.0)',
    shadowColor: '#A855F7',
  },
  star49: {
    top: '37%',
    right: '20%',
    opacity: 0.8,
    backgroundColor: 'rgba(147, 51, 234, 1.0)',
    shadowColor: '#9333EA',
  },
  star50: {
    top: '47%',
    left: '5%',
    opacity: 0.9,
    backgroundColor: 'rgba(59, 130, 246, 1.0)',
    shadowColor: '#3B82F6',
  },
  
  // Top Section
  topSection: {
    paddingTop: height * 0.12,
    alignItems: 'center',
    marginBottom: height * 0.08,
  },
  
  welcomeTitle: {
    fontSize: 52,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  welcomeSubtitle: {
    fontSize: 52,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  tagline: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: width * 0.85,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  
  // Middle Section
  middleSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: height * 0.25,
  },
  
  // Primary Button - Now MUCH wider!
  primaryButton: {
    width: width * 0.85, // 75% of screen width - significantly wider!
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0099FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  primaryButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    textAlign: 'center',
  },
  
  // Secondary Button
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'underline',
    letterSpacing: 0.3,
  },

  // Bottom Section
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  
  appIcon: {
    width: '100%',
    height: height * 0.5,
    resizeMode: 'cover',
  },

  // New styles for NaylProUpgradeScreen stars
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Changed from -1 to 1 to ensure stars are above background
    overflow: 'hidden',
  },


});

export default OnboardingWelcomeClean;
