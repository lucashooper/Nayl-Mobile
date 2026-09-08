import React, { useEffect, useState } from 'react';

import {

  View,

  Text,

  StyleSheet,

  TouchableOpacity,

  ActivityIndicator,

  Alert,

  Platform,

  StatusBar,

  useWindowDimensions,

  TextInput,

  KeyboardAvoidingView,

  ScrollView,

} from 'react-native';

import { CommonActions, useNavigation } from '@react-navigation/native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import * as AppleAuthentication from 'expo-apple-authentication';

import authService, { AuthSignInResult, isGoogleSignInConfigured } from '../services/authService';

import sessionService from '../services/sessionService';

import iapService from '../services/iapService';

import marketingDemoService from '../services/marketingDemoService';
import { preloadUserSessionData } from '../utils/assetPreloader';

import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';



const LoginScreen: React.FC = () => {

  const navigation = useNavigation();

  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState<'apple' | 'google' | 'email' | null>(null);

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [appleAuthAvailable, setAppleAuthAvailable] = useState(Platform.OS === 'ios');



  useEffect(() => {

    if (Platform.OS !== 'ios') return;

    AppleAuthentication.isAvailableAsync()

      .then(setAppleAuthAvailable)

      .catch(() => setAppleAuthAvailable(false));

  }, []);



  const authButtonWidth = Math.min(width - 64, 440);

  const googleSignInConfigured = isGoogleSignInConfigured();



  const completeAuthSignIn = async (result: AuthSignInResult) => {

    await sessionService.setUserId(result.user.id);

    await authService.applyProviderProfile(result.user, result.appleFullName);

    await iapService.identifyUser(result.user.id);

    if (await marketingDemoService.isDemoAccount()) {
      await iapService.grantDemoAccess();
    }

    await preloadUserSessionData();

    if (await marketingDemoService.isDemoAccount()) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'HomeMain' }],
        }),
      );
      return;
    }

    if (!iapService.isPurchasesEnabled()) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'HomeMain' }],
        }),
      );
      return;
    }

    let hasSubscription = false;

    try {

      const restore = await iapService.restorePurchases();

      hasSubscription = restore.success;

    } catch (error) {

      console.warn('Restore after login failed:', error);

    }



    if (!hasSubscription) {

      try {

        hasSubscription = await iapService.isProUser();

      } catch {

        hasSubscription = false;

      }

    }



    if (hasSubscription) {

      navigation.dispatch(

        CommonActions.reset({

          index: 0,

          routes: [{ name: 'HomeMain' }],

        }),

      );

      return;

    }



    Alert.alert(

      'No active subscription',

      'We could not find an active Nayl Pro subscription for this account. Subscribe to continue.',

      [

        {

          text: 'View plans',

          onPress: () => {

            navigation.dispatch(

              CommonActions.reset({

                index: 0,

                routes: [{ name: 'Onboarding', params: { paywallOnly: true } }],

              }),

            );

          },

        },

      ],

    );

  };



  const handleAppleSignIn = async () => {

    if (loading) return;

    setLoading('apple');

    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);



    try {

      const result = await authService.signInWithApple();

      await completeAuthSignIn(result);

    } catch (error) {

      if (!authService.isAppleSignInCancelled(error)) {

        Alert.alert('Sign in failed', authService.getAuthErrorMessage(error));

        console.error('Apple sign in error:', error);

      }

    } finally {

      setLoading(null);

    }

  };



  const handleGoogleSignIn = async () => {

    if (loading) return;

    setLoading('google');

    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);



    try {

      const result = await authService.signInWithGoogle();

      await completeAuthSignIn(result);

    } catch (error) {

      if (!authService.isGoogleSignInCancelled(error)) {

        Alert.alert('Sign in failed', authService.getAuthErrorMessage(error));

        console.error('Google sign in error:', error);

      }

    } finally {

      setLoading(null);

    }

  };



  const handleEmailSignIn = async () => {

    if (loading) return;

    setLoading('email');

    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);



    try {

      const result = await authService.signInWithEmailPassword(email, password);

      await completeAuthSignIn(result);

    } catch (error) {

      Alert.alert('Sign in failed', authService.getAuthErrorMessage(error));

      console.error('Email sign in error:', error);

    } finally {

      setLoading(null);

    }

  };



  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >

      <StatusBar barStyle="light-content" />

      <LinearGradient

        colors={['#000000', '#0A0A0A', '#0F0F0F']}

        style={StyleSheet.absoluteFill}

      />



      <TouchableOpacity

        style={styles.backButton}

        onPress={() => navigation.goBack()}

        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}

      >

        <Text style={styles.backText}>← Back</Text>

      </TouchableOpacity>



      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { maxWidth: authButtonWidth + 64, width: '100%', alignSelf: 'center' },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Sign in to restore your progress and Nayl Pro subscription.
        </Text>

        <Text style={styles.sectionLabel}>Sign in with email</Text>

        <TextInput

          style={[styles.input, { width: authButtonWidth, alignSelf: 'center' }]}

          placeholder="Email"

          placeholderTextColor="rgba(255,255,255,0.4)"

          autoCapitalize="none"

          autoCorrect={false}

          keyboardType="email-address"

          textContentType="emailAddress"

          value={email}

          onChangeText={setEmail}

          editable={!loading}

        />



        <View style={[styles.passwordField, { width: authButtonWidth, alignSelf: 'center' }]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry={!showPassword}
            textContentType="password"
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword((visible) => !visible)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="rgba(255,255,255,0.55)"
            />
          </TouchableOpacity>
        </View>



        <TouchableOpacity

          style={[styles.emailButton, { width: authButtonWidth, alignSelf: 'center' }]}

          onPress={handleEmailSignIn}

          activeOpacity={0.85}

          disabled={!!loading || !email.trim() || !password}

        >

          {loading === 'email' ? (

            <ActivityIndicator color="#111" />

          ) : (

            <Text style={styles.emailButtonText}>Sign in with email</Text>

          )}

        </TouchableOpacity>



        <Text style={styles.dividerText}>or continue with</Text>
      </ScrollView>

      <View style={[styles.socialSection, { maxWidth: authButtonWidth + 64, alignSelf: 'center', width: '100%' }]}>
        {Platform.OS === 'ios' && appleAuthAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={28}
            style={[styles.appleButton, { width: authButtonWidth, alignSelf: 'center' }]}
            onPress={handleAppleSignIn}
          />
        )}

        {Platform.OS === 'ios' && !appleAuthAvailable && (
          <Text style={styles.unavailableText}>
            Sign in with Apple is unavailable on this device.
          </Text>
        )}

        {googleSignInConfigured ? (
          <TouchableOpacity
            style={[styles.googleButton, { width: authButtonWidth, alignSelf: 'center' }]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.85}
            disabled={!!loading}
          >
            {loading === 'google' ? (
              <ActivityIndicator color="#111" />
            ) : (
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            )}
          </TouchableOpacity>
        ) : null}

        {loading === 'apple' && (
          <ActivityIndicator color="#fff" style={styles.loader} />
        )}

        <Text style={styles.footer}>
          New to Nayl? Go back and tap Begin to create your plan.
        </Text>
      </View>

    </KeyboardAvoidingView>

  );

};



const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: '#000',

  },

  backButton: {

    marginTop: 56,

    marginLeft: 24,

    alignSelf: 'flex-start',

  },

  backText: {

    color: 'rgba(255,255,255,0.7)',

    fontSize: 16,

  },

  content: {

    flex: 1,

    justifyContent: 'center',

    paddingHorizontal: 32,

    paddingBottom: 80,

  },

  scrollContent: {

    flexGrow: 1,

    paddingHorizontal: 32,

    paddingTop: 112,

    paddingBottom: 16,

  },

  socialSection: {

    paddingHorizontal: 32,

    paddingBottom: 48,

  },

  sectionLabel: {

    fontSize: 14,

    fontWeight: '600',

    color: 'rgba(255,255,255,0.55)',

    marginBottom: 12,

    textAlign: 'left',

    alignSelf: 'stretch',

  },

  title: {

    fontSize: 34,

    fontWeight: '600',

    color: '#fff',

    marginBottom: 12,

    textAlign: 'center',

  },

  subtitle: {

    fontSize: 16,

    color: 'rgba(255,255,255,0.65)',

    textAlign: 'center',

    lineHeight: 24,

    marginBottom: 40,

  },

  appleButton: {

    height: 56,

    marginBottom: 16,

  },

  unavailableText: {

    color: 'rgba(255,255,255,0.55)',

    fontSize: 14,

    textAlign: 'center',

    marginBottom: 16,

  },

  googleButton: {

    height: 56,

    borderRadius: 28,

    backgroundColor: '#fff',

    justifyContent: 'center',

    alignItems: 'center',

  },

  input: {

    height: 52,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.15)',

    backgroundColor: 'rgba(255,255,255,0.06)',

    color: '#fff',

    paddingHorizontal: 16,

    fontSize: 16,

    marginBottom: 12,

  },

  passwordField: {

    position: 'relative',

    marginBottom: 16,

  },

  passwordInput: {

    height: 52,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.15)',

    backgroundColor: 'rgba(255,255,255,0.06)',

    color: '#fff',

    paddingLeft: 16,

    paddingRight: 48,

    fontSize: 16,

  },

  passwordToggle: {

    position: 'absolute',

    right: 14,

    top: 0,

    bottom: 0,

    justifyContent: 'center',

    alignItems: 'center',

  },

  emailButton: {

    height: 56,

    borderRadius: 28,

    backgroundColor: '#3B82F6',

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 8,

  },

  emailButtonText: {

    color: '#fff',

    fontSize: 17,

    fontWeight: '600',

  },

  dividerText: {

    color: 'rgba(255,255,255,0.45)',

    textAlign: 'center',

    fontSize: 14,

    marginVertical: 20,

  },

  googleButtonText: {

    color: '#111',

    fontSize: 17,

    fontWeight: '600',

  },

  loader: {

    marginTop: 16,

  },

  footer: {

    marginTop: 32,

    fontSize: 14,

    color: 'rgba(255,255,255,0.45)',

    textAlign: 'center',

    lineHeight: 20,

  },

});



export default LoginScreen;


