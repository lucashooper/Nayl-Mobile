import iapService from './iapService';
import marketingDemoService from './marketingDemoService';

/**
 * Hard paywall check: may this user get past the paywall into the app?
 *
 * Needs an active Pro entitlement. Two exceptions, where no purchase is possible:
 * builds without RevenueCat configured (Expo Go, keyless Android sideloads), and
 * the demo accounts used for App Review and marketing.
 */
export async function hasAppAccess(): Promise<boolean> {
  if (!iapService.isPurchasesEnabled()) return true;
  try {
    if (await marketingDemoService.isDemoAccount()) return true;
  } catch {
    // Fall through to the entitlement check.
  }
  return iapService.isProUser();
}
