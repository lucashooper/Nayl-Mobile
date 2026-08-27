import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BackButtonProps {
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  color = '#FFFFFF',
  style,
}) => (
  <TouchableOpacity
    style={[styles.button, style]}
    onPress={onPress}
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  >
    <Ionicons name="chevron-back" size={28} color={color} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BackButton;
