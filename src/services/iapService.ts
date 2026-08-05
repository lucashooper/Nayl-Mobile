import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import sessionService from './sessionService';

const REVENUECAT_IOS_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '';

const ENTITLEMENT_ID = 'default';
const SUBSCRIPTION_STATUS_BASE = '@nayl_is_pro';
const PRODUCT_ID_PREFIX = 'nayl_pro';

async function getSubscriptionStorageKey(): Promise<string> {
  const hasUser = await sessionService.hasUser();
  if (!hasUser) {
    return SUBSCRIPTION_STATUS_BASE;
  }
  return sessionService.getUserStorageKey(SUBSCRIPTION_STATUS_BASE);
}

function hasProAccess(customerInfo: CustomerInfo): boolean {
  const activeEntitlements = customerInfo.entitlements.active;

  if (activeEntitlements[ENTITLEMENT_ID]?.isActive) {
    return true;
  }

  // Fallback if RevenueCat entitlement identifier differs from config
  if (Object.values(activeEntitlements).some((e) => e.isActive)) {
    return true;
  }

  const activeSubs = customerInfo.activeSubscriptions ?? [];
  if (activeSubs.some((id) => id.toLowerCase().includes(PRODUCT_ID_PREFIX))) {
    return true;
  }

  return false;
}

class IAPService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (Constants.appOwnership === 'expo') {
      if (__DEV__) {
        console.warn('RevenueCat is unavailable in Expo Go. Use a development build to test purchases.');
      }
      return;
    }

    if (!REVENUECAT_IOS_API_KEY || REVENUECAT_IOS_API_KEY.includes('REPLACE')) {
      console.warn('RevenueCat iOS API key is not configured.');
      return;
    }

    try {
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
      this.initialized = true;
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
    }
  }

  /** Ensure a local user + RevenueCat identity exist before purchase/restore */
  async ensurePurchaseReady(): Promise<void> {
    await this.initialize();
    if (!this.initialized) return;

    if (!(await sessionService.hasUser())) {
      await sessionService.initializeUser();
    }

    const userId = await sessionService.getCurrentUserId();
    await Purchases.logIn(userId);
  }

  async identifyUser(userId: string): Promise<void> {
    try {
      await this.initialize();
      if (!this.initialized) return;
      await Purchases.logIn(userId);
    } catch (error) {
      console.error('RevenueCat identify user error:', error);
    }
  }

  async logOut(): Promise<void> {
    try {
      await this.initialize();
      if (!this.initialized) return;
      await Purchases.logOut();
    } catch (error) {
      console.error('RevenueCat logout error:', error);
    }
  }

  private async cacheProStatus(isPro: boolean): Promise<void> {
    const storageKey = await getSubscriptionStorageKey();
    await AsyncStorage.setItem(storageKey, JSON.stringify(isPro));
  }

  private async syncCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      await this.initialize();
      if (!this.initialized) return null;
      return await Purchases.getCustomerInfo();
    } catch {
      return null;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      await this.ensurePurchaseReady();
      if (!this.initialized) return null;
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<{ success: boolean; customerInfo?: CustomerInfo; userCancelled?: boolean }> {
    try {
      await this.ensurePurchaseReady();
      if (!this.initialized) {
        throw new Error('Purchases are not configured.');
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      let isPro = hasProAccess(customerInfo);

      // Entitlements can lag briefly after a sandbox purchase — re-sync once
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

      // Sandbox often reports "already subscribed" — sync from RevenueCat instead of failing
      const alreadyOwned =
        error.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR ||
        error.code === '6';

      if (alreadyOwned || error.message?.toLowerCase().includes('already')) {
        const synced = await this.syncCustomerInfo();
        if (synced && hasProAccess(synced)) {
          await this.cacheProStatus(true);
          return { success: true, customerInfo: synced };
        }
      }

      // Last resort: sync in case Apple charged but RC threw
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
      const customerInfo = await Purchases.restorePurchases();
      const isPro = hasProAccess(customerInfo);
      await this.cacheProStatus(isPro);
      return { success: isPro, customerInfo };
    } catch (error) {
      console.error('Restore purchases error:', error);
      return { success: false };
    }
  }

  async isProUser(): Promise<boolean> {
    try {
      await this.ensurePurchaseReady();

      if (!this.initialized) {
        const storageKey = await getSubscriptionStorageKey();
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached !== null) return JSON.parse(cached);
        return false;
      }

      const customerInfo = await Purchases.getCustomerInfo();
      const isPro = hasProAccess(customerInfo);
      await this.cacheProStatus(isPro);
      return isPro;
    } catch (error) {
      try {
        const storageKey = await getSubscriptionStorageKey();
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached !== null) return JSON.parse(cached);
      } catch {
        // fall through
      }
      return false;
    }
  }
}

export default new IAPService();
