import React from 'react';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import OnboardingFlow from '../components/OnboardingFlow';
import sessionService from '../services/sessionService';
import iapService from '../services/iapService';
import profileService from '../services/profileService';
import { markWelcomePending } from '../services/welcomeService';
import { hasAppAccess } from '../services/accessGate';
import { paywallLog } from '../services/paywallLog';
import { Alert } from 'react-native';

type OnboardingRouteParams = {
  paywallOnly?: boolean;
  forceDisplay?: boolean;
};

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as OnboardingRouteParams | undefined) ?? {};
  const paywallOnly = params.paywallOnly ?? false;
  const forceDisplay = params.forceDisplay ?? paywallOnly;

  const handleFinish = async (userName: string) => {
    paywallLog('onboarding finish requested', { paywallOnly });
    const userId = await sessionService.initializeUser();
    await iapService.identifyUser(userId);

    // Hard paywall: the app is only reachable with an active 'pro' entitlement.
    if (!(await hasAppAccess('onboarding finish'))) {
      paywallLog('onboarding finish BLOCKED: staying on paywall');
      Alert.alert('Subscription required', 'Start your Nayl Pro subscription to continue.');
      return;
    }

    const trimmedName = userName.trim();
    if (trimmedName) {
      try {
        await profileService.updateProfileName(trimmedName);
      } catch (error) {
        console.error('Failed to save onboarding name:', error);
        await profileService.cacheProfileName(trimmedName);
      }
    }

    // Paywall-only runs are returning users who have already been welcomed.
    if (!paywallOnly) {
      await markWelcomePending();
    }

    paywallLog('navigate into app: onboarding finish -> HomeMain');
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'HomeMain' }],
      }),
    );
  };

  const handleLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <OnboardingFlow
      onComplete={handleFinish}
      onLogin={handleLogin}
      paywallOnly={paywallOnly}
      forceDisplay={forceDisplay}
    />
  );
};

export default OnboardingScreen;
