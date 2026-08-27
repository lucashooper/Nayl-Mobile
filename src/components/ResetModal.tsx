import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';
import AnimationService, { AnimationType } from '../services/animationService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface ResetModalProps {
  visible: boolean;
  onClose: () => void;
  onReset: (trigger: string) => void;
}

const triggerOptions = [
  { id: 'anxiety', label: 'Anxiety', emoji: '😰', description: 'Feeling overwhelmed and nervous' },
  { id: 'stress', label: 'Stress', emoji: '😤', description: 'Work or life pressure' },
  { id: 'boredom', label: 'Boredom', emoji: '😐', description: 'Nothing else to do' },
  { id: 'nervousness', label: 'Nervousness', emoji: '😬', description: 'Social situations or anticipation' },
  { id: 'habit', label: 'Habit', emoji: '🤔', description: 'Just doing it unconsciously' },
  { id: 'other', label: 'Other', emoji: '❓', description: 'Different reason' },
];

const nailBitingCycle = [
  {
    title: 'The Temptation',
    description: 'You feel the urge to bite your nails, thinking it will help you feel better or relieve stress.',
    icon: 'hand-left',
    color: '#FF6B6B',
  },
  {
    title: 'The Moment of Weakness',
    description: 'You give in and bite your nails, experiencing temporary relief or satisfaction.',
    icon: 'close-circle',
    color: '#FFA500',
  },
  {
    title: 'The Aftermath',
    description: 'The relief fades, leaving you with damaged nails, potential infections, and feelings of guilt and disappointment.',
    icon: 'sad',
    color: '#FF4757',
  },
];

const ResetModal: React.FC<ResetModalProps> = ({ 
  visible, 
  onClose, 
  onReset
}) => {
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  
  // Star positions for ambient animation (same as main page)
  const [starPositions, setStarPositions] = useState(() => 
    Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      opacity: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.15 + 0.03, // Same slow speed as main page
      directionX: (Math.random() - 0.5) * 1.5,
      directionY: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2.2 + 0.5,
    }))
  );
  
  // Animation values for modal entrance
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;
  
  // Ambient starfield animation (same as main page)
  useEffect(() => {
    if (visible) {
      const updateStarPositions = () => {
        setStarPositions(prevPositions => 
          prevPositions.map(star => {
            const newX = star.x + (star.directionX * star.speed);
            const newY = star.y + (star.directionY * star.speed);
            
            // Wrap stars around screen boundaries
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
      };
      
      const starfieldInterval = setInterval(updateStarPositions, 50); // Same 50ms interval as main page
      
      return () => clearInterval(starfieldInterval);
    }
  }, [visible]);
  
  // Smooth modal entrance
  useEffect(() => {
    if (visible) {
      // Gentle haptic feedback
      hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.NORMAL);
      
      // Smooth entrance animation
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      modalOpacity.setValue(0);
      contentTranslateY.setValue(50);
    }
  }, [visible]);
  
  const handleReset = () => {
    if (selectedTrigger) {
      // Immediately dismiss modal and trigger reset
      hapticService.trigger(HapticType.HEAVY_TAP, HapticIntensity.PROMINENT);
      onReset(selectedTrigger);
      onClose();
      setSelectedTrigger(null);
    }
  };
  
  const handleClose = () => {
    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.NORMAL);
    onClose();
  };
  
  const handleOptionSelect = (triggerId: string) => {
    hapticService.trigger(HapticType.SELECTION, HapticIntensity.NORMAL);
    setSelectedTrigger(triggerId);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.overlay,
            { opacity: modalOpacity }
          ]}
        >
          <LinearGradient
            colors={COLORS.backgroundGradient}
            style={styles.backgroundGradient}
          />
          
          {/* Subtle starfield effect */}
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
                  }
                ]}
              />
            ))}
          </View>
          
          <Animated.View
            style={[
              styles.content,
              {
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            {/* Header with close button */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={28} color={COLORS.primaryText} />
              </TouchableOpacity>
            </View>
            
            {/* Main content */}
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Warning icon */}
              <View style={styles.warningIcon}>
                <Ionicons name="warning" size={48} color={COLORS.destructiveAction} />
              </View>
              
              {/* Emotional headline */}
              <Text style={styles.headline}>You let yourself down, again.</Text>
              
              {/* Motivational text */}
              <Text style={styles.motivationalText}>
                Relapsing can be tough and make you feel awful, but it's crucial not to be too hard on yourself. 
                Understanding why you relapsed helps break the cycle.
              </Text>
              
              {/* Nail Biting Cycle */}
              <View style={styles.cycleContainer}>
                <Text style={styles.cycleTitle}>The Nail Biting Cycle</Text>
                
                {nailBitingCycle.map((step, index) => (
                  <View key={index} style={styles.cycleStep}>
                    <View style={[styles.stepIcon, { backgroundColor: step.color }]}>
                      <Ionicons name={step.icon as any} size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
              
              {/* Trigger selection — always visible list (no nested scroll) */}
              <View style={styles.triggerSection}>
                <Text style={styles.triggerQuestion}>What triggered you to bite your nails?</Text>

                {triggerOptions.map((option) => {
                  const isSelected = selectedTrigger === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.triggerOption,
                        isSelected && styles.triggerOptionSelected,
                      ]}
                      onPress={() => handleOptionSelect(option.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                      <View style={styles.optionContent}>
                        <Text style={styles.optionLabel}>{option.label}</Text>
                        <Text style={styles.optionDescription}>{option.description}</Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={COLORS.primaryAccent} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {/* Reset button */}
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  !selectedTrigger && styles.resetButtonDisabled,
                ]}
                onPress={handleReset}
                disabled={!selectedTrigger}
              >
                <LinearGradient
                  colors={selectedTrigger 
                    ? [COLORS.destructiveAction, '#FF6B6B']
                    : [COLORS.mutedText, COLORS.mutedText]
                  }
                  style={styles.resetButtonGradient}
                >
                  <Ionicons 
                    name="refresh" 
                    size={24} 
                    color={COLORS.primaryText} 
                  />
                  <Text style={styles.resetButtonText}>
                    Reset Timer
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Encouragement text */}
              <Text style={styles.encouragementText}>
                Remember: Every setback is a setup for a comeback. You've got this! 💪
              </Text>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  content: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl, // Much larger padding to move button down significantly
    paddingBottom: SPACING.sm,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  warningIcon: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headline: {
    ...TYPOGRAPHY.headingLarge,
    color: COLORS.primaryText,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  motivationalText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  cycleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  cycleTitle: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.primaryText,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  cycleStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primaryText,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  stepDescription: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.secondaryText,
  },
  triggerSection: {
    marginBottom: SPACING.lg,
  },
  triggerQuestion: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primaryText,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  triggerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: SPACING.sm,
  },
  triggerOptionSelected: {
    backgroundColor: 'rgba(193, 255, 114, 0.12)',
    borderColor: 'rgba(193, 255, 114, 0.4)',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primaryText,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.secondaryText,
  },
  resetButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  resetButtonText: {
    ...TYPOGRAPHY.buttonText,
    color: COLORS.primaryText,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  encouragementText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});

export default ResetModal; 