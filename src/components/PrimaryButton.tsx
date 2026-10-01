import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Default button width: full width minus the 24pt screen gutters, capped for iPad. */
export const PRIMARY_BUTTON_WIDTH = Math.min(SCREEN_WIDTH - 48, 440);

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  /** Blocks presses and shows the muted look. */
  disabled?: boolean;
  /** Muted look only; the button still receives presses (e.g. to show a hint). */
  muted?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The one primary call to action used across onboarding and the paywall:
 * a solid white pill with black text, like Opal and Luma.
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  muted = false,
  loading = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  // While loading, keep the solid look so the spinner stays visible.
  const isMuted = (disabled && !loading) || muted;

  return (
    <Animated.View style={[styles.wrapper, pressStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        disabled={disabled || loading}
        style={[styles.button, isMuted && styles.buttonMuted]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {loading ? (
          <ActivityIndicator color="#000000" size="small" />
        ) : (
          <Text style={[styles.text, isMuted && styles.textMuted]} numberOfLines={1}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: PRIMARY_BUTTON_WIDTH,
    alignSelf: 'center',
  },
  button: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  buttonMuted: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
  textMuted: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export default PrimaryButton;
