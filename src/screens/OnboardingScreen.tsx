import React from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import OnboardingFlow from '../components/OnboardingFlow';
import sessionService from '../services/sessionService';

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleFinish = async () => {
    await sessionService.initializeUser();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'HomeMain' }],
      }),
    );
  };

  return <OnboardingFlow onComplete={handleFinish} />;
};

export default OnboardingScreen;
