import React, { useMemo, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('screen');

interface AppLoadingScreenProps {
  bootReady: boolean;
  onFinish: () => void;
}

const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ bootReady, onFinish }) => {
  const overlayOpacity = useSharedValue(1);

  const stars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        id: index,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.6,
        starOpacity: Math.random() * 0.5 + 0.15,
      })),
    [],
  );

  useEffect(() => {
    if (!bootReady) return;

    overlayOpacity.value = withTiming(
      0,
      { duration: 300, easing: Easing.out(Easing.ease) },
      (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      },
    );
  }, [bootReady, onFinish, overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, overlayStyle]} pointerEvents={bootReady ? 'none' : 'auto'}>
      <StatusBar style="light" />

      <View style={styles.starfield} pointerEvents="none">
        {stars.map((star) => (
          <View
            key={star.id}
            style={{
              position: 'absolute',
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              backgroundColor: '#FFFFFF',
              opacity: star.starOpacity,
            }}
          />
        ))}
      </View>

      <View style={styles.centerWrap} pointerEvents="none">
        <Text style={styles.brandTitle}>Nayl</Text>
        <Image
          source={require('../../assets/cosmic-nail-nobg.webp')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  starfield: {
    ...StyleSheet.absoluteFillObject,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  brandTitle: {
    fontSize: 56,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  logoImage: {
    width: Math.min(width * 0.58, 240),
    height: Math.min(height * 0.26, 280),
    backgroundColor: 'transparent',
  },
});

export default AppLoadingScreen;
