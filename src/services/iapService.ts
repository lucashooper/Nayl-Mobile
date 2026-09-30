import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import sessionService from './sessionService';

export type IAPPackage = import('react-native-purchases').PurchasesPackage;
type PurchasesOffering = import('react-native-purchases').PurchasesOffering;
type CustomerInfo = import('react-native-purchases').CustomerInfo;

const REVENUECAT_IOS_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim() ?? '';
const REVENUECAT_ANDROID_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim() ?? '';

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

function getPurchasesModule(): typeof import('react-native-purchases') | null {
  if (isExpoGo()) return null;
  try {
    return require('react-native-purchases') as typeof import('react-native-purchases');
  } catch {
    return null;
  }
}

/** Production Android keys start with goog_. Test keys (test_) must not be used in release builds. */
function hasAndroidProductionKey(): boolean {
  return (
    REVENUECAT_ANDROID_API_KEY.startsWith('goog_') &&
    !REVENUECAT_ANDROID_API_KEY.includes('REPLACE')
  );
}

function hasIosKey(): boolean {
  return Boolean(REVENUECAT_IOS_API_KEY) && !REVENUECAT_IOS_API_KEY.includes('REPLACE');
}

/** Whether RevenueCat should be initialized on this platform. */
export function isPurchasesEnabled(): boolean {
  if (isExpoGo()) return false;
  if (Platform.OS === 'android') {
    return hasAndroidProductionKey();
  }
  return hasIosKey();
}

// The RevenueCat entitlement that unlocks the app. Nothing else counts as access.
export const PRO_ENTITLEMENT_ID = 'pro';
const SUBSCRIPTION_STATUS_BASE = '@nayl_is_pro';

async function getSubscriptionStorageKey(): Promise<string> {
  const hasUser = await sessionService.hasUser();
  if (!hasUser) {
    return SUBSCRIPTION_STATUS_BASE;
  }
  return sessionService.getUserStorageKey(SUBSCRIPTION_STATUS_BASE);
}

function hasProAccess(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]?.isActive === true;
}

class IAPService {
  private initialized = false;

  isPurchasesEnabled(): boolean {
    return isPurchasesEnabled();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const Purchases = getPurchasesModule()?.default;
    if (!Purchases) {
      if (__DEV__ && isExpoGo()) {
        console.warn('RevenueCat is unavailable in Expo Go. Email login still works for UI testing.');
      }
      return;
    }

    if (!isPurchasesEnabled()) {
      if (__DEV__) {
        console.warn(
          Platform.OS === 'android'
            ? 'RevenueCat skipped on Android — no production goog_ API key (investor/sideload mode).'
            : 'RevenueCat iOS API key is not configured.',
        );
      }
      return;
    }

    const apiKey =
      Platform.OS === 'android' ? REVENUECAT_ANDROID_API_KEY : REVENUECAT_IOS_API_KEY;

    try {
      const { LOG_LEVEL } = getPurchasesModule()!;
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      Purchases.configure({ apiKey });
      this.initialized = true;
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
    }
  }

  async ensurePurchaseReady(): Promise<void> {
    await this.initialize();
    if (!this.initialized) return;

    const Purchases = getPurchasesModule()?.default;
    if (!Purchases) return;

    if (!(await sessionService.hasUser())) {
      await sessionService.initializeUser();
    }

    const userId = await sessionService.getCurrentUserId();
    if ((await Purchases.getAppUserID()) !== userId) {
      await Purchases.logIn(userId);
    }
  }

  async identifyUser(userId: string): Promise<void> {
    try {
      await this.initialize();
      if (!this.initialized) return;
      const Purchases = getPurchasesModule()?.default;
      if (!Purchases) return;
      await Purchases.logIn(userId);
    } catch (error) {
      console.error('RevenueCat identify user error:', error);
    }
  }

  async logOut(): Promise<void> {
    try {
      await this.initialize();
      if (!this.initialized) return;
      const Purchases = getPurchasesModule()?.default;
      if (!Purchases) return;
      await Purchases.logOut();
    } catch (error) {
      console.error('RevenueCat logout error:', error);
    }
  }

  async grantDemoAccess(): Promise<void> {
    await this.cacheProStatus(true);
  }

  private async cacheProStatus(isPro: boolean): Promise<void> {
    const storageKey = await getSubscriptionStorageKey();
    await AsyncStorage.setItem(storageKey, JSON.stringify(isPro));
  }

  private async syncCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      await this.initialize();
      if (!this.initialized) return null;
      const Purchases = getPurchasesModule()?.default;
      if (!Purchases) return null;
      return await Purchases.getCustomerInfo();
    } catch {
      return null;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      await this.ensurePurchaseReady();
      if (!this.initialized) return null;
      const Purchases = getPurchasesModule()?.default;
      if (!Purchases) return null;
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  }

  async purchasePackage(
    pkg: IAPPackage,
  ): Promise<{ success: boolean; customerInfo?: CustomerInfo; userCancelled?: boolean }> {
    try {
      await this.ensurePurchaseReady();
      if (!this.initialized) {
        throw new Error('Purchases are not configured.');
      }

      const Purchases = getPurchasesModule()?.default;
      if (!Purchases) {
        throw new Error('Purchases are not configured.');
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      let isPro = hasProAccess(customerInfo);

      if (!isPro) {
        const synced = await this.syncCustomerInfo();
        if (synced) {
          isPro = hasProAccess(synced);
        }
      }

      if (__DEV__) {
        console.log('[IAP] Purchase entitlements:', Object.keys(customerInfo.entitlements.active));
        console.log('[IAP] Active subscriptions:', customerInfo.activeSubscriptions);
        console.log('[IAP] isPro:', isPro);
      }

      await this.cacheProStatus(isPro);
      return { success: isPro, customerInfo };
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false, userCancelled: true };
      }

      const { PURCHASES_ERROR_CODE } = getPurchasesModule() ?? {};
      const alreadyOwned =
        error.code === PURCHASES_ERROR_CODE?.PRODUCT_ALREADY_PURCHASED_ERROR ||
        error.code === '6';

      if (alreadyOwned || error.message?.toLowerCase().includes('already')) {
        const synced = await this.syncCustomerInfo();
        if (synced && hasProAccess(synced)) {
          await this.cacheProStatus(true);
          return { success: true, customerInfo: synced };
        }
      }

      const synced = await this.syncCustomerInfo();
      if (synced && hasProAccess(synced)) {
        await this.cacheProStatus(true);
        return { success: true, customerInfo: synced };
      }

      console.error('Purchase error:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
    try {
      await this.ensurePurchaseReady();
      if (!this.initialized) {
        return { success: false };
      }
      const Purchases = getPurchasesModule()?.default;
      if (!Purchases) return { success: false };
      const customerInfo = await Purchases.restorePurchases();
      const isPro = hasProAccess(customerInfo);
      await this.cacheProStatus(isPro);
      return { success: isPro, customerInfo };
    } catch (error) {
      console.error('Restore purchases error:', error);
      return { success: false };
    }
  }

  /**
   * True only when RevenueCat reports an active 'pro' entitlement. Never reads the
   * AsyncStorage cache when purchases are enabled, so stale state can't unlock the app.
   * Offline, the RevenueCat SDK answers from its own on-device CustomerInfo cache.
   */
  async isProUser(): Promise<boolean> {
    if (!isPurchasesEnabled()) {
      try {
        const cached = await AsyncStorage.getItem(await getSubscriptionStorageKey());
        return cached !== null && JSON.parse(cached) === true;
      } catch {
        return false;
      }
    }

    try {
      await this.ensurePurchaseReady();
    } catch (error) {
      // logIn can fail offline; the SDK keeps the last identified user.
      if (__DEV__) console.warn('[IAP] ensurePurchaseReady failed:', error);
    }
    if (!this.initialized) return false;

    try {
      const Purchases = getPurchasesModule()?.default;
      if (!Purchases) return false;
      const customerInfo = await Purchases.getCustomerInfo();
      const isPro = hasProAccess(customerInfo);
      await this.cacheProStatus(isPro);
      return isPro;
    } catch {
      return false;
    }
  }

  /**
   * Whether this user can still get the weekly plan's free trial. Unknown counts as
   * eligible; only an explicit "ineligible" / "no offer" answer hides the trial.
   */
  async isEligibleForIntroOffer(productId: string): Promise<boolean> {
    try {
      const Purchases = getPurchasesModule()?.default;
      if (!this.initialized || !Purchases) return true;
      const result = await Purchases.checkTrialOrIntroductoryPriceEligibility([productId]);
      const status = result[productId]?.status;
      const { INTRO_ELIGIBILITY_STATUS } = Purchases;
      return (
        status !== INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_INELIGIBLE &&
        status !== INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_NO_INTRO_OFFER_EXISTS
      );
    } catch {
      return true;
    }
  }
}

export default new IAPService();
