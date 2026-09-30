import React, { useEffect, useState } from 'react';
import { createStackNavigator, CardStyleInterpolators, TransitionSpecs } from '@react-navigation/stack';
import { Easing, View } from 'react-native';
import sessionService from '../services/sessionService';
import { hasAppAccess } from '../services/accessGate';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LibraryScreen from '../screens/LibraryScreen';
import MeditationScreen from '../screens/MeditationScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ReasonsScreen from '../screens/ReasonsScreen';
import TriggerHistoryScreen from '../screens/TriggerHistoryScreen';
import RelaxationSoundScreen from '../screens/RelaxationSoundScreen';
import LearningScreen from '../screens/LearningScreen';
import ArticlesScreen from '../screens/ArticlesScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import OnboardingQuestionnaireScreen from '../screens/OnboardingQuestionnaireScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import EditStreakScreen from '../screens/EditStreakScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import NailProgressScreen from '../screens/NailProgressScreen';
import NaylProPaywallScreen from '../screens/NaylProPaywallScreen';

const Stack = createStackNavigator();

// Standardized screen transition configuration
const screenTransitionConfig = {
  transitionSpec: {
    open: {
      animation: 'timing' as const,
      config: {
        duration: 250,
        easing: Easing.out(Easing.ease),
      },
    },
    close: {
      animation: 'timing' as const,
      config: {
        duration: 250,
        easing: Easing.in(Easing.ease),
      },
    },
  },
  cardStyle: {
    backgroundColor: '#000000',
  },
  cardStyleInterpolator: ({ current, layouts }: any) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  gestureResponseDistance: 50,
};

const meditationScreenOptions = {
  gestureEnabled: true,
  gestureDirection: 'vertical' as const,
  cardStyle: { backgroundColor: '#000000' },
  cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },
};

// Home stack with standardized transitions
export function HomeStack() {
  const cachedHasUser = sessionService.getCachedHasUser();
  // Returning users only reach Home after the hard-paywall check; otherwise they
  // start on the paywall.
  const [initialRoute, setInitialRoute] = useState<string | null>(() =>
    cachedHasUser === false ? 'Onboarding' : null,
  );
  const [paywallOnly, setPaywallOnly] = useState(false);

  useEffect(() => {
    if (cachedHasUser === false) return;
    let cancelled = false;

    (async () => {
      const hasUser = cachedHasUser ?? (await sessionService.hasUser());
      if (!hasUser) {
        if (!cancelled) setInitialRoute('Onboarding');
        return;
      }
      const allowed = await hasAppAccess().catch(() => false);
      if (cancelled) return;
      setPaywallOnly(!allowed);
      setInitialRoute(allowed ? 'HomeMain' : 'Onboarding');
    })();

    return () => {
      cancelled = true;
    };
  }, [cachedHasUser]);

  if (!initialRoute) {
    return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false, ...screenTransitionConfig }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        initialParams={paywallOnly ? { paywallOnly: true, forceDisplay: true } : undefined}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen name="OnboardingQuestionnaire" component={OnboardingQuestionnaireScreen} />
      <Stack.Screen name="EditStreak" component={EditStreakScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen
        name="NaylProPaywall"
        component={NaylProPaywallScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen name="Meditation" component={MeditationScreen} options={meditationScreenOptions} />
    </Stack.Navigator>
  );
}

// Profile stack with standardized transitions
export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...screenTransitionConfig }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen
        name="NaylProPaywall"
        component={NaylProPaywallScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen name="Reasons" component={ReasonsScreen} />
      <Stack.Screen name="TriggerHistory" component={TriggerHistoryScreen} />
      <Stack.Screen name="NailProgress" component={NailProgressScreen} />
    </Stack.Navigator>
  );
}

// Library stack with standardized transitions
export function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...screenTransitionConfig }}>
      <Stack.Screen name="LibraryMain" component={LibraryScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="RelaxationSound" component={RelaxationSoundScreen} />
      <Stack.Screen name="Learning" component={LearningScreen} />
      <Stack.Screen name="Articles" component={ArticlesScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <Stack.Screen name="Meditation" component={MeditationScreen} options={meditationScreenOptions} />
    </Stack.Navigator>
  );
}
