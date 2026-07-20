import { StyleSheet } from 'react-native';
import { FONT_FAMILY } from './fonts';

const COLORS = {
  primaryText: '#FFFFFF',
  secondaryText: '#A9A9A9',
  mutedText: '#6B7280',
  primaryAccent: '#C1FF72',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
};

export const typography = StyleSheet.create({
  displayLarge: {
    fontFamily: FONT_FAMILY.black,
    fontSize: FONT_SIZES['5xl'],
    color: COLORS.primaryText,
  },
  displayMedium: {
    fontFamily: FONT_FAMILY.extraBold,
    fontSize: FONT_SIZES['4xl'],
    color: COLORS.primaryText,
  },
  h1: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.primaryText,
  },
  h2: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.primaryText,
  },
  h3: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.primaryText,
  },
  h4: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primaryText,
  },
  bodyLarge: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primaryText,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZES.base,
    color: COLORS.primaryText,
  },
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.primaryText,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryText,
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryText,
  },
  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondaryText,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZES.base,
    color: COLORS.primaryText,
  },
  buttonTextSmall: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryText,
  },
  timerText: {
    fontFamily: FONT_FAMILY.extraBold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.primaryText,
  },
  timerLabel: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondaryText,
  },
  appTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.primaryText,
  },
  orbText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: FONT_SIZES['4xl'],
    color: COLORS.primaryText,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
});

export const {
  displayLarge,
  displayMedium,
  h1,
  h2,
  h3,
  h4,
  bodyLarge,
  bodyMedium,
  body,
  bodySmall,
  label,
  caption,
  buttonText,
  buttonTextSmall,
  timerText,
  timerLabel,
  appTitle,
  orbText,
} = typography;
