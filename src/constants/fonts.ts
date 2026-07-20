/** Loaded via @expo-google-fonts/inter in App.tsx — use these instead of fontWeight on 'Inter' */
export const FONT_FAMILY = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
} as const;

export const FONTS = {
  inter: FONT_FAMILY.regular,
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
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

export const FONT_STYLES = {
  h1: { fontFamily: FONT_FAMILY.bold, fontSize: FONTS['4xl'] },
  h2: { fontFamily: FONT_FAMILY.bold, fontSize: FONTS['3xl'] },
  h3: { fontFamily: FONT_FAMILY.semiBold, fontSize: FONTS['2xl'] },
  h4: { fontFamily: FONT_FAMILY.semiBold, fontSize: FONTS.xl },
  body: { fontFamily: FONT_FAMILY.regular, fontSize: FONTS.base },
  bodySmall: { fontFamily: FONT_FAMILY.regular, fontSize: FONTS.sm },
  bodyLarge: { fontFamily: FONT_FAMILY.regular, fontSize: FONTS.lg },
  label: { fontFamily: FONT_FAMILY.medium, fontSize: FONTS.sm },
  caption: { fontFamily: FONT_FAMILY.regular, fontSize: FONTS.xs },
  button: { fontFamily: FONT_FAMILY.semiBold, fontSize: FONTS.base },
  buttonSmall: { fontFamily: FONT_FAMILY.semiBold, fontSize: FONTS.sm },
};
