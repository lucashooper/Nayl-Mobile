import React from 'react';
import { Platform } from 'react-native';

type PerformanceWrapperProps = {
  screenName: string;
  children: React.ReactNode;
};

/** Dev-only render monitoring — iOS native module excluded on Android builds. */
const PerformanceWrapper: React.FC<PerformanceWrapperProps> = ({ screenName, children }) => {
  if (Platform.OS === 'ios') {
    const { PerformanceMeasureView } = require('@shopify/react-native-performance');
    return <PerformanceMeasureView screenName={screenName}>{children}</PerformanceMeasureView>;
  }
  return <>{children}</>;
};

export default PerformanceWrapper;
