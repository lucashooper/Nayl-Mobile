import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import profileService from './profileService';
import sessionService from './sessionService';

export type AuthSignInResult = {
  user: User;
  appleFullName?: AppleAuthentication.AppleAuthenticationFullName | null;
};

const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? '';
const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '';

/** Native auth modules are unavailable in Expo Go — need a dev/production build */
export function isNativeAuthAvailable(): boolean {
  return Constants.appOwnership !== 'expo';
}

export function isGoogleSignInConfigured(): boolean {
  if (Platform.OS === 'android') {
    return Boolean(GOOGLE_WEB_CLIENT_ID);
  }
  return Boolean(GOOGLE_IOS_CLIENT_ID);
}

class AuthService {
  private configured = false;

  private generateNonce(length = 32): string {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    return result;
  }

  getAuthErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const err = error as { message?: string; code?: string; error_code?: string };
      const code = err.error_code ?? err.code;
      if (code === 'email_not_confirmed') {
        return 'This email address has not been confirmed yet. In Supabase, open Authentication → Users, delete this account, then sign up again (with Confirm email turned off).';
      }
      if (err.message) return err.message;
    }
    return 'Authentication failed. Please try again.';
  }

  configure(): void {
    if (!isNativeAuthAvailable() || this.configured || !isGoogleSignInConfigured()) {
      return;
    }
    // Lazy require so Expo Go doesn't crash on missing native module
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      if (Platform.OS === 'android') {
        GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
      } else {
        GoogleSignin.configure({
          iosClientId: GOOGLE_IOS_CLIENT_ID,
          ...(GOOGLE_WEB_CLIENT_ID ? { webClientId: GOOGLE_WEB_CLIENT_ID } : {}),
        });
      }
      this.configured = true;
    } catch {
      // Native module not linked — expected in Expo Go
    }
  }

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  private formatAppleFullName(
    fullName: AppleAuthentication.AppleAuthenticationFullName | null | undefined,
  ): string | null {
    if (!fullName) return null;
    const parts = [fullName.givenName, fullName.familyName].filter(Boolean) as string[];
    return parts.length > 0 ? parts.join(' ') : null;
  }

  private deriveNameFromEmail(email: string): string {
    const localPart = email.split('@')[0] ?? 'User';
    return (
      localPart
        .split(/[._-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ') || 'User'
    );
  }

  /** Save provider name without asking the user again (Sign in with Apple guideline 4.0). */
  async applyProviderProfile(user: User, appleFullName?: AppleAuthentication.AppleAuthenticationFullName | null): Promise<void> {
    try {
      const existing = await profileService.getProfileData();
      const currentName = existing.profile_name?.trim();
      if (currentName && currentName !== 'Your Name') {
        return;
      }

      const metadata = user.user_metadata ?? {};
      const resolvedName =
        this.formatAppleFullName(appleFullName) ??
        (typeof metadata.full_name === 'string' ? metadata.full_name : null) ??
        (typeof metadata.name === 'string' ? metadata.name : null) ??
        (user.email ? this.deriveNameFromEmail(user.email) : null);

      if (resolvedName) {
        await profileService.updateProfileName(resolvedName);
      }
    } catch (error) {
      console.warn('Could not apply provider profile name:', error);
    }
  }

  async signInWithApple(): Promise<AuthSignInResult> {
    if (!isNativeAuthAvailable()) {
      throw new Error('Sign in with Apple requires a development or production build.');
    }
    if (Platform.OS !== 'ios') {
      throw new Error('Sign in with Apple is only available on iOS.');
    }

    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      throw new Error('Sign in with Apple is not available on this device.');
    }

    const rawNonce = this.generateNonce();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce,
    );

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!credential.identityToken) {
      throw new Error('Apple Sign In did not return an identity token.');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Sign in with Apple failed.');

    return { user: data.user, appleFullName: credential.fullName };
  }

  async signInWithEmailPassword(email: string, password: string): Promise<AuthSignInResult> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new Error('Email and password are required.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Sign in failed.');

    return { user: data.user };
  }

  async signInWithGoogle(): Promise<AuthSignInResult> {
    if (!isNativeAuthAvailable()) {
      throw new Error('Google Sign In requires a development or production build.');
    }

    this.configure();

    if (!isGoogleSignInConfigured()) {
      throw new Error('Google Sign In is not configured.');
    }

    const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    const idToken = response.data?.idToken;

    if (!idToken) {
      throw new Error('Google Sign In did not return an identity token.');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Sign in with Google failed.');

    return { user: data.user };
  }

  async deleteAccount(): Promise<void> {
    await sessionService.deleteAllUserData();

    const { error } = await supabase.rpc('delete_user');
    if (error) {
      console.warn('delete_user RPC failed (run supabase/delete-user.sql if needed):', error.message);
    }

    await this.signOut();
  }

  isGoogleSignInCancelled(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const code = (error as { code?: string }).code;
    return code === 'SIGN_IN_CANCELLED' || code === '-5';
  }

  isAppleSignInCancelled(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const code = (error as { code?: string }).code;
    return code === 'ERR_REQUEST_CANCELED';
  }

  async signOut(): Promise<void> {
    try {
      if (this.configured && isNativeAuthAvailable()) {
        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        await GoogleSignin.signOut();
      }
    } catch {
      // Ignore — user may not have signed in with Google
    }
    await supabase.auth.signOut();
  }
}

export default new AuthService();
