import React, { useMemo, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface AppLoadingScreenProps {
  bootReady: boolean;
  onFinish: () => void;
}

const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ bootReady, onFinish }) => {
  const overlayOpacity = useSharedValue(1);
  const nativeSplashHidden = useRef(false);

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

    if (!nativeSplashHidden.current) {
      nativeSplashHidden.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }

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

      <LinearGradient
        colors={['#020408', '#090A0F', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

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

      <View style={styles.content}>
        <Image
          source={require('../../assets/splash.png')}
          style={styles.splashImage}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  starfield: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  splashImage: {
    width: width * 0.55,
    height: width * 0.55,
    maxWidth: 280,
    maxHeight: 280,
  },
});

export default AppLoadingScreen;
