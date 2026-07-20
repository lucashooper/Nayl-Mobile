import React from 'react';
import { View, StyleSheet } from 'react-native';
import OnboardingQuiz from './OnboardingQuiz';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  return (
    <View style={styles.container}>
      <OnboardingQuiz onComplete={onComplete} />
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
