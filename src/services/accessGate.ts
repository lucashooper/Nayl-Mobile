import { Platform } from 'react-native';
import iapService from './iapService';
import marketingDemoService from './marketingDemoService';

/**
 * Hard paywall check: may this user get past the paywall into the app?
 *
 * Requires an active RevenueCat 'pro' entitlement. The only exceptions, none of
 * which a normal App Store user can reach:
 * - dev builds / Expo Go, and keyless Android sideloads, where nothing can be bought;
 * - a signed-in App Review or marketing demo account (needs that account's password).
 * An iOS release build without a RevenueCat key is locked, not waved through.
 */
export async function hasAppAccess(): Promise<boolean> {
  if (!iapService.isPurchasesEnabled()) {
    return __DEV__ || Platform.OS === 'android';
  }
  try {
    if (await marketingDemoService.isDemoAccount()) return true;
  } catch {
    // Fall through to the entitlement check.
  }
  return iapService.isProUser();
}
