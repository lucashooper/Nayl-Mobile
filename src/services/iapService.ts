import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import sessionService from './sessionService';

const REVENUECAT_IOS_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '';

const ENTITLEMENT_ID = 'default';
const SUBSCRIPTION_STATUS_BASE = '@nayl_is_pro';

async function getSubscriptionStorageKey(): Promise<string> {
  return sessionService.getUserStorageKey(SUBSCRIPTION_STATUS_BASE);
}

class IAPService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

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

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      await this.initialize();
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
      await this.initialize();
      if (!this.initialized) {
        throw new Error('Purchases are not configured.');
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      const storageKey = await getSubscriptionStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(isPro));
      return { success: isPro, customerInfo };
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false, userCancelled: true };
      }
      console.error('Purchase error:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
    try {
      await this.initialize();
      if (!this.initialized) {
        throw new Error('Purchases are not configured.');
      }
      const customerInfo = await Purchases.restorePurchases();
      const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      const storageKey = await getSubscriptionStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(isPro));
      return { success: isPro, customerInfo };
    } catch (error) {
      console.error('Restore purchases error:', error);
      throw error;
    }
  }

  async isProUser(): Promise<boolean> {
    try {
      const hasUser = await sessionService.hasUser();
      if (!hasUser) return false;

      await this.initialize();
      if (!this.initialized) {
        const storageKey = await getSubscriptionStorageKey();
        const cached = await AsyncStorage.getItem(storageKey);
        if (cached !== null) return JSON.parse(cached);
        return false;
      }
      const customerInfo = await Purchases.getCustomerInfo();
      const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      const storageKey = await getSubscriptionStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(isPro));
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
