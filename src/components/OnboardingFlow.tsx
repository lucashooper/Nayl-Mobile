import React from 'react';
import { View, StyleSheet } from 'react-native';
import OnboardingQuiz from './OnboardingQuiz';

interface OnboardingFlowProps {
  onComplete: (userName: string) => void;
  onLogin: () => void;
  paywallOnly?: boolean;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onLogin, paywallOnly = false }) => {
  return (
    <View style={styles.container}>
      <OnboardingQuiz onComplete={onComplete} onLogin={onLogin} paywallOnly={paywallOnly} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default OnboardingFlow;
