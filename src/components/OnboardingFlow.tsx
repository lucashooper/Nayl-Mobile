import React from 'react';
import { View, StyleSheet } from 'react-native';
import OnboardingQuiz from './OnboardingQuiz';

interface OnboardingFlowProps {
  onComplete: (userName: string) => void;
  onLogin: () => void;
  paywallOnly?: boolean;
  forceDisplay?: boolean;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onLogin,
  paywallOnly = false,
  forceDisplay = false,
}) => {
  return (
    <View style={styles.container}>
      <OnboardingQuiz
        onComplete={onComplete}
        onLogin={onLogin}
        paywallOnly={paywallOnly}
        forceDisplay={forceDisplay}
      />
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
