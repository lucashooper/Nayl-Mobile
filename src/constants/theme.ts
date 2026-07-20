// Nayl App Design System - Theme Constants

export const COLORS = {
  // Primary Colors - Premium Dark Theme
  primaryBackground: '#0A0A0F',
  secondaryBackground: '#1A1A2E',
  cardBackground: '#16213E',
  
  // Premium Accent Colors
  primaryAccent: '#C1FF72',
  secondaryAccent: '#0A4F6B',
  accentGradient: ['#C1FF72', '#A8E85C'],
  
  // Premium UI Colors
  premiumWhite: '#F8FAFC', // Subtle off-white for premium feel
  
  // Enhanced Semantic Colors
  destructiveAction: '#FF4757',
  success: '#2ED573',
  warning: '#FFA502',
  info: '#3742FA',
  
  // Premium Text Colors
  primaryText: '#FFFFFF',
  secondaryText: '#E2E8F0',
  mutedText: '#94A3B8',
  placeholder: '#64748B',
  
  // Background Colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Premium Gradients
  // Subtle three-stop gradient with deeper navy base and a soft indigo-mid for more depth
  backgroundGradient: ['rgb(15, 23, 42)', 'rgb(33, 28, 75)', 'rgb(15, 23, 48)'] as const,
  orbGradient: ['#667eea', '#764ba2', '#f093fb'] as const,
  orbGlow: 'rgba(255, 255, 255, 0.55)',
  
  
  // Enhanced UI Colors
  progressBar: '#4F46E5',
  progressBarFill: '#818CF8',
  buttonGradient: ['#667eea', '#764ba2'],
  
  // Glassmorphism & Footer Colors
  glassBackground: 'rgba(22, 33, 62, 0.85)', // Semi-transparent card background
  glassBorder: 'rgba(255, 255, 255, 0.08)', // Subtle white border for glass effect
  glassShadow: 'rgba(0, 0, 0, 0.25)', // Soft shadow for depth
  footerBackground: 'rgba(15, 15, 20, 0.92)', // Premium glassmorphic mix of black and gray like Sweatcoin
  footerBorder: 'rgba(255, 255, 255, 0.08)', // More subtle border for natural look
  
  // Enhanced Icon Colors for Premium Footer
  iconActivePrimary: '#FFFFFF', // Pure white for active state
  iconActiveSecondary: '#C1FF72', // Accent color for secondary fill
  iconInactivePrimary: 'rgb(255, 0, 0)', // Primary fill - currently dark gray
  iconInactiveSecondary: 'rgb(255, 0, 0)', // Secondary fill - currently darker gray
  iconGlow: 'rgba(193, 255, 114, 0.3)', // Subtle glow for active icons
};

import { FONT_FAMILY } from './fonts';

export const TYPOGRAPHY = {
  displayLarge: { fontSize: 56, fontFamily: FONT_FAMILY.black },
  displayMedium: { fontSize: 42, fontFamily: FONT_FAMILY.extraBold },

  headingLarge: { fontSize: 36, fontFamily: FONT_FAMILY.bold },
  headingMedium: { fontSize: 28, fontFamily: FONT_FAMILY.semiBold },
  headingSmall: { fontSize: 22, fontFamily: FONT_FAMILY.semiBold },

  bodyLarge: { fontSize: 20, fontFamily: FONT_FAMILY.medium },
  bodyMedium: { fontSize: 18, fontFamily: FONT_FAMILY.regular },
  bodySmall: { fontSize: 16, fontFamily: FONT_FAMILY.regular },

  caption: { fontSize: 14, fontFamily: FONT_FAMILY.regular },
  buttonText: { fontSize: 18, fontFamily: FONT_FAMILY.semiBold },
  timerText: { fontSize: 48, fontFamily: FONT_FAMILY.extraBold, fontVariant: ['tabular-nums'] as const },

  heroText: { fontSize: 52, fontFamily: FONT_FAMILY.black },
};

export const SPACING = {
  // 4-Point Grid System
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  // Premium Button shadows
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  
  // Premium Card shadows
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Enhanced Glow effects
  glow: {
    shadowColor: COLORS.primaryAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  
  // Orb glow effect
  orbGlow: {
    shadowColor: COLORS.orbGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
  },
  
  // Premium depth shadows
  deep: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  
  // Glassmorphism shadows for premium footer
  glass: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  
  // Footer-specific shadows for depth
  footer: {
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
};

export const ANIMATIONS = {
  // Duration constants
  fast: 200,
  normal: 300,
  slow: 400,
  verySlow: 800,
  
  // Easing functions
  easeInOut: 'ease-in-out',
  easeOut: 'ease-out',
  easeIn: 'ease-in',
};

export const LAYOUT = {
  // Screen dimensions
  screenPadding: SPACING.lg,
  componentPadding: SPACING.md,
  
  // Component sizes
  buttonHeight: 48,
  inputHeight: 48,
  tabBarHeight: 80,
  
  // Orb dimensions
  orbSize: 200,
  orbRingWidth: 8,
  progressDotSize: 8,
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATIONS,
  LAYOUT,
}; 