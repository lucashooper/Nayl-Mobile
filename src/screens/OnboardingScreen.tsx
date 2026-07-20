import React from 'react';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import OnboardingFlow from '../components/OnboardingFlow';
import sessionService from '../services/sessionService';
import iapService from '../services/iapService';
import profileService from '../services/profileService';
import { markWelcomePending } from '../services/welcomeService';

type OnboardingRouteParams = {
  paywallOnly?: boolean;
};

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const paywallOnly = (route.params as OnboardingRouteParams | undefined)?.paywallOnly ?? false;

  const handleFinish = async (userName: string) => {
    const userId = await sessionService.initializeUser();
    await iapService.identifyUser(userId);

    const trimmedName = userName.trim();
    if (trimmedName) {
      try {
        await profileService.updateProfileName(trimmedName);
      } catch (error) {
        console.error('Failed to save onboarding name:', error);
        await profileService.cacheProfileName(trimmedName);
      }
    }

    await markWelcomePending();

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
    />
  );
};

export default OnboardingScreen;
