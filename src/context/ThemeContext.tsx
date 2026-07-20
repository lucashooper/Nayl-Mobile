import React, { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';

export type ThemeType = 'midnight' | 'ocean' | 'twilight';

export interface ThemeColors {
  // Background colors
  backgroundGradient: readonly [string, string, string];
  primaryBackground: string;
  secondaryBackground: string;
  cardBackground: string;
  
  // Text colors
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  
  // Accent colors
  primaryAccent: string;
  secondaryAccent: string;
  
  // Button colors
  buttonGradient: readonly [string, string];
  buttonGradientHover: readonly [string, string];
  
  // Additional UI colors
  destructiveAction: string;
  overlayBackground: string;
  glassBorder: string;
  glassBorderLight: string;
  glassBorderPremium: string;
  premiumWhite: string;
  
  // Glassmorphism & Footer Colors
  glassBackground: string;
  glassShadow: string;
  footerBackground: string;
  footerBorder: string;
  
  // Enhanced Icon Colors for Premium Footer
  iconActivePrimary: string;
  iconActiveSecondary: string;
  iconInactivePrimary: string;
  iconInactiveSecondary: string;
  iconGlow: string;
}

export const THEMES: Record<ThemeType, ThemeColors> = {
  midnight: {
    // Midnight dark theme (current)
    backgroundGradient: ['rgba(2, 4, 12, 0.98)', 'rgba(1, 2, 8, 0.99)', 'rgba(0, 1, 4, 1)'],
    primaryBackground: '#020408',
    secondaryBackground: '#0A0A0F',
    cardBackground: '#16213E',
    primaryText: '#FFFFFF',
    secondaryText: '#E2E8F0',
    mutedText: '#94A3B8',
    primaryAccent: '#C1FF72',
    secondaryAccent: '#0A4F6B',
    buttonGradient: ['rgba(20, 25, 35, 0.9)', 'rgba(10, 15, 25, 0.95)'],
    buttonGradientHover: ['rgba(30, 35, 45, 0.9)', 'rgba(20, 25, 35, 0.95)'],
    destructiveAction: '#FF4757',
    overlayBackground: 'rgba(0, 0, 0, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassBorderLight: 'rgba(255, 255, 255, 0.1)',
    glassBorderPremium: 'rgba(255, 255, 255, 0.14)',
    premiumWhite: '#F8FAFC',
    
    // Glassmorphism & Footer Colors
    glassBackground: 'rgba(22, 33, 62, 0.85)',
    glassShadow: 'rgba(0, 0, 0, 0.25)',
    footerBackground: 'rgba(15, 15, 20, 0.92)', // Premium glassmorphic mix of black and gray like Sweatcoin
    footerBorder: 'rgba(255, 255, 255, 0.08)', // More subtle border for natural look
    
    // Enhanced Icon Colors for Premium Footer
    iconActivePrimary: '#FFFFFF',
    iconActiveSecondary: '#C1FF72',
    iconInactivePrimary: '#B8B8B8', // Much more subtle gray for inactive primary
    iconInactiveSecondary: '#6B6B6B', // Very muted gray for inactive secondary
    iconGlow: 'rgba(193, 255, 114, 0.3)',
  },
  ocean: {
    // Ocean blue theme (previous)
    backgroundGradient: ['#1E3A8A', '#1E40AF', '#3B82F6'],
    primaryBackground: '#16213E',
    secondaryBackground: '#1A1A2E',
    cardBackground: '#16213E',
    primaryText: '#FFFFFF',
    secondaryText: '#E2E8F0',
    mutedText: '#94A3B8',
    primaryAccent: '#C1FF72',
    secondaryAccent: '#0A4F6B',
    buttonGradient: ['rgb(22, 27, 56)', 'rgb(14, 19, 41)'],
    buttonGradientHover: ['rgb(58, 58, 90)', 'rgb(42, 42, 74)'],
    destructiveAction: '#FF4757',
    overlayBackground: 'rgba(0, 0, 0, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassBorderLight: 'rgba(255, 255, 255, 0.1)',
    glassBorderPremium: 'rgba(255, 255, 255, 0.14)',
    premiumWhite: '#F8FAFC',
    
    // Glassmorphism & Footer Colors
    glassBackground: 'rgba(22, 33, 62, 0.85)',
    glassShadow: 'rgba(0, 0, 0, 0.25)',
    footerBackground: 'rgba(15, 15, 20, 0.92)', // Premium glassmorphic mix of black and gray like Sweatcoin
    footerBorder: 'rgba(255, 255, 255, 0.08)', // More subtle border for natural look
    
    // Enhanced Icon Colors for Premium Footer
    iconActivePrimary: '#FFFFFF',
    iconActiveSecondary: '#C1FF72',
    iconInactivePrimary: '#B8B8B8', // Much more subtle gray for inactive primary
    iconInactiveSecondary: '#6B6B6B', // Very muted gray for inactive secondary
    iconGlow: 'rgba(193, 255, 114, 0.3)',
  },
  twilight: {
    backgroundGradient: ['rgb(48, 12, 87)', 'rgb(63, 11, 54)', 'rgb(80, 19, 118)'],
    primaryBackground: '#0A0A1A',
    secondaryBackground: '#1A1A2E',
    cardBackground: '#16213E',
    primaryText: '#FFFFFF',
    secondaryText: '#E2E8F0',
    mutedText: '#94A3B8',
    primaryAccent: '#C1FF72',
    secondaryAccent: '#0A4F6B',
    buttonGradient: ['rgba(22, 33, 62, 0.9)', 'rgba(26, 26, 46, 0.95)'],
    buttonGradientHover: ['rgba(34, 49, 78, 0.9)', 'rgba(30, 30, 54, 0.95)'],
    destructiveAction: '#FF4757',
    overlayBackground: 'rgba(0, 0, 0, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassBorderLight: 'rgba(255, 255, 255, 0.1)',
    glassBorderPremium: 'rgba(255, 255, 255, 0.14)',
    premiumWhite: '#F8FAFC',
    
    // Glassmorphism & Footer Colors
    glassBackground: 'rgba(22, 33, 62, 0.85)',
    glassShadow: 'rgba(0, 0, 0, 0.25)',
    footerBackground: 'rgba(15, 15, 20, 0.92)', // Premium glassmorphic mix of black and gray like Sweatcoin
    footerBorder: 'rgba(255, 255, 255, 0.08)', // More subtle border for natural look
    
    // Enhanced Icon Colors for Premium Footer
    iconActivePrimary: '#FFFFFF',
    iconActiveSecondary: '#C1FF72',
    iconInactivePrimary: '#B8B8B8', // Much more subtle gray for inactive primary
    iconInactiveSecondary: '#6B6B6B', // Very muted gray for inactive secondary
    iconGlow: 'rgba(193, 255, 114, 0.3)',
  },
};

// Note: THEMES validation happens at runtime, not module load time

interface ThemeContextType {
  currentTheme: ThemeType;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  isReady: boolean;
}

// Global fallback theme - this ensures useTheme never fails
const FALLBACK_THEME: ThemeContextType = {
  currentTheme: 'midnight',
  colors: {
    // Hardcoded fallback colors to avoid dependency on THEMES
    backgroundGradient: ['#000000', '#000000', '#000000'] as const,
    primaryBackground: '#000000',
    secondaryBackground: '#1A1A1A',
    cardBackground: '#2A2A2A',
    primaryText: '#FFFFFF',
    secondaryText: '#E0E0E0',
    mutedText: '#A0A0A0',
    primaryAccent: '#C1FF72',
    secondaryAccent: '#0A4F6B',
    buttonGradient: ['#2A2A2A', '#1A1A1A'] as const,
    buttonGradientHover: ['#3A3A3A', '#2A2A2A'] as const,
    destructiveAction: '#FF4757',
    overlayBackground: 'rgba(0, 0, 0, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassBorderLight: 'rgba(255, 255, 255, 0.1)',
    glassBorderPremium: 'rgba(255, 255, 255, 0.14)',
    premiumWhite: '#F8FAFC',
    
    // Glassmorphism & Footer Colors
    glassBackground: 'rgba(42, 42, 42, 0.85)',
    glassShadow: 'rgba(0, 0, 0, 0.25)',
    footerBackground: 'rgba(15, 15, 20, 0.92)', // Premium glassmorphic mix of black and gray like Sweatcoin
    footerBorder: 'rgba(255, 255, 255, 0.08)', // More subtle border for natural look
    
    // Enhanced Icon Colors for Premium Footer
    iconActivePrimary: '#FFFFFF',
    iconActiveSecondary: '#C1FF72',
    iconInactivePrimary: '#B8B8B8', // Much more subtle gray for inactive primary
    iconInactiveSecondary: '#6B6B6B', // Very muted gray for inactive secondary
    iconGlow: 'rgba(193, 255, 114, 0.3)',
  },
  setTheme: () => {
    console.warn('⚠️ setTheme called on fallback theme');
  },
  toggleTheme: () => {
    console.warn('⚠️ toggleTheme called on fallback theme');
  },
  isReady: true, // Mark as ready since it's a static fallback
};

// Note: FALLBACK_THEME validation happens at runtime, not module load time

// Create context with fallback to prevent undefined context
const ThemeContext = createContext<ThemeContextType>(FALLBACK_THEME);

// Note: React Native 0.79.5 may have different context behavior
// We'll handle this through proper error boundaries and fallbacks

// Error boundary component for theme context
class ThemeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('❌ ThemeErrorBoundary caught error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ ThemeErrorBoundary error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when theme context fails
      return (
        <View style={{ 
          flex: 1, 
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Theme Error - Please restart app</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Main useTheme hook with improved error handling
export const useTheme = (): ThemeContextType => {
  try {
    const context = useContext(ThemeContext);
    
    // Check if we're outside of the provider or if context is undefined/null
    if (!context || typeof context !== 'object') {
      console.warn('⚠️ useTheme: Context not ready yet, using fallback');
      return FALLBACK_THEME;
    }
    
    // Ensure context has the required structure and colors are valid
    if (context.colors && 
        typeof context.colors === 'object' &&
        context.colors.primaryBackground &&
        context.colors.primaryText &&
        context.isReady) {
      return context;
    }
    
    // If colors are missing or invalid, return fallback
    console.warn('⚠️ useTheme: Colors not ready yet, using fallback');
    return FALLBACK_THEME;
  } catch (error) {
    console.error('❌ useTheme error:', error);
    return FALLBACK_THEME;
  }
};

// Alternative useTheme hook for React Native 0.79.5 compatibility
export const useThemeSafe = (): ThemeContextType => {
  try {
    const context = useContext(ThemeContext);
    
    // Check if we're outside of the provider
    if (!context) {
      console.error('❌ useThemeSafe called outside of ThemeProvider');
      return FALLBACK_THEME;
    }
    
    // Multiple validation checks
    if (context && 
        typeof context === 'object' && 
        context.colors && 
        typeof context.colors === 'object' &&
        context.colors.primaryBackground &&
        context.colors.primaryText) {
      return context;
    }
  } catch (error) {
    console.error('❌ useThemeSafe error:', error);
  }
  
  // Return fallback theme
  return FALLBACK_THEME;
};

// Super safe useTheme hook that guarantees a valid return
export const useThemeGuaranteed = (): ThemeContextType => {
  try {
    const result = useTheme();
    
    // Double-check that the result is valid
    if (result && 
        typeof result === 'object' && 
        result.colors && 
        typeof result.colors === 'object' &&
        result.colors.primaryBackground &&
        result.colors.primaryText) {
      return result;
    }
    
    console.warn('⚠️ useTheme returned invalid result, using fallback. Result:', result);
    return FALLBACK_THEME;
  } catch (error) {
    console.error('❌ useThemeGuaranteed error:', error);
    return FALLBACK_THEME;
  }
};

// HOC to wrap components with theme safety
export function withThemeSafety<P extends object>(
  Component: React.ComponentType<P & { colors: ThemeColors }>
) {
  return function ThemedComponent(props: P) {
    try {
      const themeResult = useThemeGuaranteed();
      
      // Safely destructure with fallback
      const colors = themeResult?.colors;
      const isReady = themeResult?.isReady;
      
      if (!isReady || !colors) {
        // Show a minimal fallback while theme loads
        return (
          <View style={{ 
            flex: 1, 
            backgroundColor: '#000000',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{ color: '#FFFFFF' }}>Loading theme...</Text>
          </View>
        );
      }
      
      return <Component {...props} colors={colors} />;
    } catch (error) {
      console.error('❌ withThemeSafety error:', error);
      // Fallback UI on error
      return (
        <View style={{ 
          flex: 1, 
          backgroundColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: '#FFFFFF' }}>Theme error</Text>
        </View>
      );
    }
  };
}

// Main ThemeProvider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeErrorBoundary>
      <ThemeProviderContent>{children}</ThemeProviderContent>
    </ThemeErrorBoundary>
  );
};

// Internal ThemeProvider content
const ThemeProviderContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('midnight');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme && (savedTheme === 'midnight' || savedTheme === 'ocean' || savedTheme === 'twilight')) {
        setCurrentTheme(savedTheme === 'ocean' ? 'midnight' : (savedTheme as ThemeType));
      } else {
        // No saved theme, use default
        setCurrentTheme('midnight');
      }
    } catch (error) {
      console.error('❌ ThemeProvider error loading saved theme:', error);
      // Fallback to midnight theme on error
      setCurrentTheme('midnight');
    } finally {
      setIsLoading(false);
      // Only set initialized to true after a small delay to ensure state updates
      setTimeout(() => setIsInitialized(true), 100);
    }
  };

  const setTheme = async (theme: ThemeType) => {
    try {
      await AsyncStorage.setItem('selectedTheme', theme);
      setCurrentTheme(theme);
    } catch (error) {
      console.error('❌ ThemeProvider error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'midnight' ? 'ocean' : 'midnight';
    setTheme(newTheme);
  };

  // Safely access THEMES with fallback
  if (!THEMES || typeof THEMES !== 'object') {
    console.error('❌ THEMES constant is not properly defined, using hardcoded fallback');
    const hardcodedColors: ThemeColors = {
      backgroundGradient: ['#000000', '#000000', '#000000'] as const,
      primaryBackground: '#000000',
      secondaryBackground: '#1A1A1A',
      cardBackground: '#2A2A2A',
      primaryText: '#FFFFFF',
      secondaryText: '#E0E0E0',
      mutedText: '#A0A0A0',
      primaryAccent: '#C1FF72',
      secondaryAccent: '#0A4F6B',
      buttonGradient: ['#2A2A2A', '#1A1A1A'] as const,
      buttonGradientHover: ['#3A3A3A', '#2A2A2A'] as const,
      destructiveAction: '#FF4757',
      overlayBackground: 'rgba(0, 0, 0, 0.8)',
      glassBorder: 'rgba(255, 255, 255, 0.15)',
      glassBorderLight: 'rgba(255, 255, 255, 0.1)',
      glassBorderPremium: 'rgba(255, 255, 255, 0.14)',
      premiumWhite: '#F8FAFC',
      
      // Glassmorphism & Footer Colors
      glassBackground: 'rgba(42, 42, 42, 0.85)',
      glassShadow: 'rgba(0, 0, 0, 0.25)',
      footerBackground: 'rgba(15, 15, 20, 0.92)', // Premium glassmorphic mix of black and gray like Sweatcoin
      footerBorder: 'rgba(255, 255, 255, 0.08)', // More subtle border for natural look
      
      // Enhanced Icon Colors for Premium Footer
      iconActivePrimary: '#FFFFFF',
      iconActiveSecondary: '#C1FF72',
      iconInactivePrimary: '#B8B8B8', // Much more subtle gray for inactive primary
      iconInactiveSecondary: '#6B6B6B', // Very muted gray for inactive secondary
      iconGlow: 'rgba(193, 255, 114, 0.3)',
    };
    
    const contextValue: ThemeContextType = {
      currentTheme,
      colors: hardcodedColors,
      setTheme,
      toggleTheme,
      isReady: isInitialized,
    };
    
    return (
      <ThemeContext.Provider value={contextValue}>
        {children}
      </ThemeContext.Provider>
    );
  }
  
  const defaultTheme = THEMES.midnight;
  const currentThemeColors = THEMES[currentTheme] || defaultTheme;
  
  // Ensure all required properties exist by merging with default theme
  let finalColors = {
    ...defaultTheme, // Start with default values
    ...currentThemeColors, // Override with current theme
  };
  
  // Validate the final colors object
  if (!finalColors || typeof finalColors !== 'object') {
    console.error('❌ Invalid finalColors object:', finalColors);
    // Use hardcoded fallback colors if THEMES is not available
    finalColors = {
      backgroundGradient: ['#000000', '#000000', '#000000'] as const,
      primaryBackground: '#000000',
      secondaryBackground: '#1A1A1A',
      cardBackground: '#2A2A2A',
      primaryText: '#FFFFFF',
      secondaryText: '#E0E0E0',
      mutedText: '#A0A0A0',
      primaryAccent: '#C1FF72',
      secondaryAccent: '#0A4F6B',
      buttonGradient: ['#2A2A2A', '#1A1A1A'] as const,
      buttonGradientHover: ['#3A3A3A', '#2A2A2A'] as const,
      destructiveAction: '#FF4757',
      overlayBackground: 'rgba(0, 0, 0, 0.8)',
      glassBorder: 'rgba(255, 255, 255, 0.15)',
      glassBorderLight: 'rgba(255, 255, 255, 0.1)',
      glassBorderPremium: 'rgba(255, 255, 255, 0.14)',
      premiumWhite: '#F8FAFC',
      
      // Glassmorphism & Footer Colors
      glassBackground: 'rgba(42, 42, 42, 0.85)',
      glassShadow: 'rgba(0, 0, 0, 0.25)',
      footerBackground: 'rgba(15, 15, 20, 0.92)', // Premium glassmorphic mix of black and gray like Sweatcoin
      footerBorder: 'rgba(255, 255, 255, 0.08)', // More subtle border for natural look
      
      // Enhanced Icon Colors for Premium Footer
      iconActivePrimary: '#FFFFFF',
      iconActiveSecondary: '#C1FF72',
      iconInactivePrimary: '#B8B8B8', // Much more subtle gray for inactive primary
      iconInactiveSecondary: '#6B6B6B', // Very muted gray for inactive secondary
      iconGlow: 'rgba(193, 255, 114, 0.3)',
    } as ThemeColors;
  }
  
  // Create context value with guaranteed valid colors
  const contextValue: ThemeContextType = {
    currentTheme,
    colors: finalColors, // This is guaranteed to be valid
    setTheme,
    toggleTheme,
    isReady: isInitialized, // Mark as ready when initialized
  };

  // Don't render children until theme is loaded and validated
  if (isLoading || !isInitialized) {
    console.log('⏳ ThemeProvider still loading, showing loading state');
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        {/* Simple loading state */}
      </View>
    );
  }

  // Comprehensive validation before providing context
  if (!contextValue || 
      !contextValue.colors || 
      typeof contextValue.colors !== 'object' ||
      !contextValue.colors.primaryBackground ||
      !contextValue.colors.primaryText) {
    console.error('❌ Context validation failed, using fallback. Context:', contextValue);
    return (
      <ThemeContext.Provider value={FALLBACK_THEME}>
        {children}
      </ThemeContext.Provider>
    );
  }

  // Only mark as ready when colors are fully validated
  const finalContextValue = {
    ...contextValue,
    isReady: true
  };

  console.log('✅ ThemeProvider successfully created context with colors:', {
    primaryBackground: finalContextValue.colors.primaryBackground,
    primaryText: finalContextValue.colors.primaryText
  });

  return (
    <ThemeContext.Provider value={finalContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
