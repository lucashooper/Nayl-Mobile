import { Platform } from 'react-native';
import iapService from './iapService';
import marketingDemoService from './marketingDemoService';
import { paywallLog, describeError } from './paywallLog';

// Set only by the "DEV: continue without purchase" button, which exists only in
// dev builds where RevenueCat can't run (Expo Go). Lives in memory for this session.
let devBypassGranted = false;

/** True in dev builds without RevenueCat (Expo Go): the paywall shows a DEV skip button. */
export function isDevPaywallBypassAvailable(): boolean {
  return __DEV__ && !iapService.isPurchasesEnabled();
}

export function grantDevPaywallBypass(): void {
  if (!isDevPaywallBypassAvailable()) return;
  devBypassGranted = true;
  paywallLog('DEV bypass granted by button (Expo Go / no RevenueCat). Not possible in App Store builds.');
}

/**
 * Hard paywall check: may this user get past the paywall into the app?
 *
 * Requires an active RevenueCat 'pro' entitlement. Exceptions, none reachable by a
 * normal App Store user:
 * - dev builds without RevenueCat (Expo Go), only after tapping the DEV button;
 * - keyless Android sideloads (nothing can be bought there);
 * - a signed-in App Review or marketing demo account (needs that account's password).
 * Any error fails closed: no access.
 *
 * `caller` names who is asking, so the [Paywall] log shows every decision point.
 */
export async function hasAppAccess(caller: string): Promise<boolean> {
  try {
    if (!iapService.isPurchasesEnabled()) {
      if (__DEV__) {
        paywallLog(`access ${devBypassGranted ? 'GRANTED' : 'DENIED'} (${caller})`, {
          rule: devBypassGranted ? 'dev-bypass-button' : 'dev-no-revenuecat, waiting for DEV button',
        });
        return devBypassGranted;
      }
      const allowed = Platform.OS === 'android';
      paywallLog(`access ${allowed ? 'GRANTED' : 'DENIED'} (${caller})`, {
        rule: allowed ? 'android-keyless-sideload' : 'release build without RevenueCat key',
      });
      return allowed;
    }

    try {
      if (await marketingDemoService.isDemoAccount()) {
        paywallLog(`access GRANTED (${caller})`, { rule: 'demo-account' });
        return true;
      }
    } catch (error) {
      paywallLog('demo-account check failed, ignoring', describeError(error));
    }

    const isPro = await iapService.isProUser();
    paywallLog(`access ${isPro ? 'GRANTED' : 'DENIED'} (${caller})`, { rule: "'pro' entitlement" });
    return isPro;
  } catch (error) {
    paywallLog(`access DENIED (${caller}): check threw`, describeError(error));
    return false;
  }
}
