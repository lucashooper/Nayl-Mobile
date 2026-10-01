import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from './PrimaryButton';
import { ChartLineUp, FlowerLotus, Siren, Trophy } from 'phosphor-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';
import iapService, { IAPPackage } from '../services/iapService';
import { hasAppAccess, isDevPaywallBypassAvailable, grantDevPaywallBypass } from '../services/accessGate';
import { paywallLog, describeError } from '../services/paywallLog';

import { PRIVACY_POLICY_URL, TERMS_URL } from '../constants/legalUrls';

const { width, height } = Dimensions.get('window');

interface NaylProUpgradeScreenProps {
  onUnlockPro: () => void;
  /** Always show plans — used for App Review and Profile → Plans (skips auto-dismiss). */
  forceDisplay?: boolean;
}

type PlanId = 'weekly' | 'monthly' | 'yearly';

const PLAN_DETAILS: Record<PlanId, { title: string; duration: string; cadence: string }> = {
  weekly: { title: 'Nayl Pro: Weekly', duration: '1 week', cadence: 'week' },
  monthly: { title: 'Nayl Pro: Monthly', duration: '1 month', cadence: 'month' },
  yearly: { title: 'Nayl Pro: Yearly', duration: '1 year', cadence: 'year' },
};

// Shown only before StoreKit prices load (Expo Go / offline). Production uses localized priceString from Apple.
const FALLBACK_PRICES: Record<PlanId, string> = {
  weekly: '$4.99',
  monthly: '$9.99',
  yearly: '$39.99',
};

const NaylProUpgradeScreen: React.FC<NaylProUpgradeScreenProps> = ({
  onUnlockPro,
  forceDisplay = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('weekly');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [packages, setPackages] = useState<Record<string, IAPPackage>>({});
  const [weeklyTrialEligible, setWeeklyTrialEligible] = useState(true);
  // Parents pass a new onUnlockPro each render; keep the latest without re-running the load.
  const onUnlockProRef = useRef(onUnlockPro);
  onUnlockProRef.current = onUnlockPro;

  // Fetch available packages from RevenueCat on mount
  useEffect(() => {
    const loadOfferings = async () => {
      try {
        // Hard paywall: only skip straight through with a verified 'pro' entitlement
        // (or a build/account that can't buy anything, see hasAppAccess).
        paywallLog('paywall opened', { forceDisplay });
        if (!forceDisplay && (await hasAppAccess('paywall auto-skip on open'))) {
          paywallLog('navigate into app: paywall auto-skipped, user already has access');
          onUnlockProRef.current();
          return;
        }

        if (!iapService.isPurchasesEnabled()) {
          return;
        }

        const offering = await iapService.getOfferings();
        if (offering?.availablePackages) {
          const pkgMap: Record<string, IAPPackage> = {};
          for (const pkg of offering.availablePackages) {
            const productId = pkg.product.identifier.toLowerCase();
            if (productId.includes('weekly')) {
              pkgMap.weekly = pkg;
            } else if (productId.includes('yearly') || productId.includes('annual')) {
              pkgMap.yearly = pkg;
            } else if (productId.includes('monthly')) {
              pkgMap.monthly = pkg;
            } else {
              const id = pkg.packageType.toLowerCase();
              if (id.includes('week')) pkgMap.weekly = pkg;
              else if (id.includes('month')) pkgMap.monthly = pkg;
              else if (id.includes('annual') || id.includes('year')) pkgMap.yearly = pkg;
            }
          }
          setPackages(pkgMap);
          if (pkgMap.weekly) {
            setWeeklyTrialEligible(
              await iapService.isEligibleForIntroOffer(pkgMap.weekly.product.identifier),
            );
          }
        }
      } catch (error) {
        // Fails closed: without packages the subscribe button shows "Unavailable".
        paywallLog('paywall load FAILED', describeError(error));
      }
    };
    loadOfferings();
  }, [forceDisplay]);

  const getPlanTitle = (planId: PlanId): string => {
    const pkg = packages[planId];
    if (pkg?.product?.title) return pkg.product.title;
    return PLAN_DETAILS[planId].title;
  };

  const getPriceString = (planId: PlanId): string => {
    const pkg = packages[planId];
    if (pkg?.product?.priceString) return pkg.product.priceString;
    return FALLBACK_PRICES[planId];
  };

  // The weekly plan's free trial, as App Store Connect's intro offer reports it through
  // RevenueCat. Null when there's no free intro or this user already used it, so the UI
  // never promises a trial Apple won't give.
  const getWeeklyTrial = (): { days: string; label: string } | null => {
    // Before products load (and in Expo Go, where they never do) show the 3-day trial
    // configured in App Store Connect. Once RevenueCat answers, its data decides.
    if (!packages.weekly) {
      return { days: '3-Day', label: '3 Days Free' };
    }

    const intro = packages.weekly?.product?.introPrice as
      | { price?: number; periodNumberOfUnits?: number; periodUnit?: string; cycles?: number }
      | null
      | undefined;

    if (!weeklyTrialEligible || !intro || intro.price == null || intro.price > 0) {
      return null;
    }

    const units = intro.periodNumberOfUnits ?? intro.cycles;
    if (units == null || !intro.periodUnit) {
      return null;
    }

    const unit = intro.periodUnit.charAt(0).toUpperCase() + intro.periodUnit.slice(1).toLowerCase();
    return {
      days: `${units}-${unit}`, // "3-Day"
      label: `${units} ${unit}${units === 1 ? '' : 's'} Free`, // "3 Days Free"
    };
  };

  const weeklyTrial = getWeeklyTrial();
  const selectedTrial = selectedPlan === 'weekly' ? weeklyTrial : null;

  // One subtle line under the button; still states the post-trial price and auto-renewal.
  const getFootnote = (): string => {
    const price = `${getPriceString(selectedPlan)}/${PLAN_DETAILS[selectedPlan].cadence}`;
    return selectedTrial
      ? `${selectedTrial.label}, then ${price}. Auto-renews, cancel anytime in Apple ID Settings.`
      : `${price}. Auto-renews, cancel anytime in Apple ID Settings.`;
  };

  const getPrimaryButtonLabel = (): string => {
    if (selectedTrial) return `Start ${selectedTrial.days} Free Trial`;
    return `Subscribe for ${getPriceString(selectedPlan)}`;
  };

  const openTerms = () => Linking.openURL(TERMS_URL);
  const openPrivacy = () => Linking.openURL(PRIVACY_POLICY_URL);

  // Animation values for entrance animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.8);
  
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(40);

  // Start animations on mount
  useEffect(() => {
    const startAnimations = () => {
      // Header animation (immediate)
      headerOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

      // Icon animation (300ms delay)
      setTimeout(() => {
        iconOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        iconScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      }, 300);

      // Button animation (600ms delay)
      setTimeout(() => {
        buttonOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
        buttonTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }, 600);
    };

    const timer = setTimeout(startAnimations, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const handleUnlockPro = async () => {
    try {
      setIsPurchasing(true);
      await hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);

      const pkg = packages[selectedPlan];
      if (!pkg) {
        paywallLog('subscribe tapped but no package loaded', {
          plan: selectedPlan,
          loaded: Object.keys(packages),
          purchasesEnabled: iapService.isPurchasesEnabled(),
        });
        Alert.alert(
          'Unavailable',
          'Subscription products are not available right now. Please try again later.',
        );
        setIsPurchasing(false);
        return;
      }

      const result = await iapService.purchasePackage(pkg);

      if (result.userCancelled) {
        setIsPurchasing(false);
        return;
      }

      if (result.success) {
        paywallLog('navigate into app: purchase succeeded', { plan: selectedPlan });
        onUnlockPro();
      } else {
        // Sandbox can charge Apple but lag on RC entitlements — try restore before failing
        const restored = await iapService.restorePurchases();
        if (restored.success) {
          paywallLog('navigate into app: restore after purchase succeeded', { plan: selectedPlan });
          onUnlockPro();
        } else {
          paywallLog('purchase did not grant pro; staying on paywall', { plan: selectedPlan });
          Alert.alert(
            'Purchase Failed',
            'Your purchase could not be completed. If you were charged, tap Restore Purchase below.',
          );
        }
      }
    } catch (error: any) {
      paywallLog('purchase flow threw; staying on paywall', describeError(error));
      Alert.alert('Error', error?.message ?? 'An unexpected error occurred.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsRestoring(true);
      const result = await iapService.restorePurchases();
      if (result.success) {
        await hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
        Alert.alert('Restored!', 'Your Nayl Pro subscription has been restored.', [
          {
            text: 'Continue',
            onPress: () => {
              paywallLog('navigate into app: restore button');
              onUnlockPro();
            },
          },
        ]);
      } else {
        Alert.alert('No Subscription Found', 'We could not find an active subscription to restore.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Could not restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Subtle Floating Stars (same as PersonalizedPlanScreen) */}
      <View style={styles.starsContainer}>
        <View style={[styles.star, styles.star1]} />
        <View style={[styles.star, styles.star2]} />
        <View style={[styles.star, styles.star3]} />
        <View style={[styles.star, styles.star4]} />
        <View style={[styles.star, styles.star5]} />
        <View style={[styles.star, styles.star6]} />
        <View style={[styles.star, styles.star7]} />
        <View style={[styles.star, styles.star8]} />
        <View style={[styles.star, styles.star9]} />
        <View style={[styles.star, styles.star10]} />
        <View style={[styles.star, styles.star11]} />
        <View style={[styles.star, styles.star12]} />
        <View style={[styles.star, styles.star13]} />
        <View style={[styles.star, styles.star14]} />
        <View style={[styles.star, styles.star15]} />
        <View style={[styles.star, styles.star16]} />
        <View style={[styles.star, styles.star17]} />
        <View style={[styles.star, styles.star18]} />
        <View style={[styles.star, styles.star19]} />
        <View style={[styles.star, styles.star20]} />
        <View style={[styles.star, styles.star21]} />
        <View style={[styles.star, styles.star22]} />
        <View style={[styles.star, styles.star23]} />
        <View style={[styles.star, styles.star24]} />
        <View style={[styles.star, styles.star25]} />
        <View style={[styles.star, styles.star26]} />
        <View style={[styles.star, styles.star27]} />
        <View style={[styles.star, styles.star28]} />
        <View style={[styles.star, styles.star29]} />
        <View style={[styles.star, styles.star30]} />
        <View style={[styles.star, styles.star31]} />
        <View style={[styles.star, styles.star32]} />
        <View style={[styles.star, styles.star33]} />
        <View style={[styles.star, styles.star34]} />
        <View style={[styles.star, styles.star35]} />
        <View style={[styles.star, styles.star36]} />
        <View style={[styles.star, styles.star37]} />
        <View style={[styles.star, styles.star38]} />
        <View style={[styles.star, styles.star39]} />
        <View style={[styles.star, styles.star40]} />
        <View style={[styles.star, styles.star41]} />
        <View style={[styles.star, styles.star42]} />
        <View style={[styles.star, styles.star43]} />
        <View style={[styles.star, styles.star44]} />
        <View style={[styles.star, styles.star45]} />
        <View style={[styles.star, styles.star46]} />
        <View style={[styles.star, styles.star47]} />
        <View style={[styles.star, styles.star48]} />
        <View style={[styles.star, styles.star49]} />
        <View style={[styles.star, styles.star50]} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header Section */}
        <Animated.View style={[styles.headerSection, headerStyle]}>
          {/* Dev-only escape hatch for Expo Go (no RevenueCat): long-press the title.
              Nothing is rendered for it, and it does nothing outside __DEV__. */}
          <Text
            style={styles.mainHeadline}
            onLongPress={
              __DEV__ && isDevPaywallBypassAvailable()
                ? () => {
                    grantDevPaywallBypass();
                    paywallLog('navigate into app: DEV long-press bypass');
                    onUnlockPro();
                  }
                : undefined
            }
          >
            Unlock Nayl Pro
          </Text>
          <Text style={styles.subHeadline}>
            Premium tools for lasting change
          </Text>
        </Animated.View>

        {/* App Icon Section - Moved higher up */}
        <Animated.View style={[styles.iconSection, iconStyle]}>
          <View style={styles.iconGlowContainer}>
            <Image
              source={require('../../assets/onboarding-icons/Nayl-cooler-logo.webp')}
              style={styles.appIcon}
              resizeMode="cover"
            />
          </View>
        </Animated.View>

        {/* Premium Features Showcase */}
        <Animated.View style={[styles.featuresSection, buttonStyle]}>
          <View style={styles.featureList}>
            <View style={styles.featureRow}>
              <View style={styles.featureRowIcon}>
                <Siren size={18} color="#FFFFFF" weight="duotone" />
              </View>
              <Text style={styles.featureRowText}>Panic button for urges</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureRowIcon}>
                <Trophy size={18} color="#FFFFFF" weight="duotone" />
              </View>
              <Text style={styles.featureRowText}>Achievements and milestones</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureRowIcon}>
                <ChartLineUp size={18} color="#FFFFFF" weight="duotone" />
              </View>
              <Text style={styles.featureRowText}>Progress analytics</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureRowIcon}>
                <FlowerLotus size={18} color="#FFFFFF" weight="duotone" />
              </View>
              <Text style={styles.featureRowText}>Meditations and calming sounds</Text>
            </View>
          </View>
        </Animated.View>

        {/* Purchase Options Section */}
        <Animated.View style={[styles.purchaseSection, buttonStyle]}>
          <View style={styles.purchaseOverlay}>
            <View style={styles.purchaseOptionsContainer}>
              {/* Weekly Option */}
              <TouchableOpacity
                style={[styles.purchaseOption, selectedPlan === 'weekly' && styles.purchaseOptionSelected]}
                onPress={() => setSelectedPlan('weekly')}
                activeOpacity={0.8}
              >
                <View style={[styles.popularTag, weeklyTrial && styles.trialTag]}>
                  <Text style={styles.popularTagText}>{weeklyTrial ? 'free trial' : 'most popular'}</Text>
                </View>
                <Text style={styles.purchaseOptionTitle}>{getPlanTitle('weekly')}</Text>
                <Text style={styles.purchaseOptionPrice}>{getPriceString('weekly')}</Text>
                {weeklyTrial ? (
                  <Text style={[styles.purchaseOptionCadence, styles.trialCadence]} numberOfLines={2}>
                    {weeklyTrial.label}, then {getPriceString('weekly')}/wk
                  </Text>
                ) : (
                  <Text style={styles.purchaseOptionCadence}>per week</Text>
                )}
              </TouchableOpacity>

              {/* Yearly Option */}
              <TouchableOpacity
                style={[styles.purchaseOption, selectedPlan === 'yearly' && styles.purchaseOptionSelected]}
                onPress={() => setSelectedPlan('yearly')}
                activeOpacity={0.8}
              >
                <Text style={styles.purchaseOptionTitle}>{getPlanTitle('yearly')}</Text>
                <Text style={styles.purchaseOptionPrice}>{getPriceString('yearly')}</Text>
                <Text style={styles.purchaseOptionCadence}>per year</Text>
              </TouchableOpacity>

              {/* Monthly Option */}
              <TouchableOpacity
                style={[styles.purchaseOption, selectedPlan === 'monthly' && styles.purchaseOptionSelected]}
                onPress={() => setSelectedPlan('monthly')}
                activeOpacity={0.8}
              >
                <Text style={styles.purchaseOptionTitle}>{getPlanTitle('monthly')}</Text>
                <Text style={styles.purchaseOptionPrice}>{getPriceString('monthly')}</Text>
                <Text style={styles.purchaseOptionCadence}>per month</Text>
              </TouchableOpacity>
            </View>

            {/* Unlock Button */}
            <PrimaryButton
              title={getPrimaryButtonLabel()}
              onPress={handleUnlockPro}
              disabled={isPurchasing}
              loading={isPurchasing}
              style={styles.unlockButton}
            />

            <Text style={styles.subscriptionFinePrint}>{getFootnote()}</Text>

            {/* Footer Links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity
                onPress={handleRestorePurchases}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator color="#94A3B8" size="small" />
                ) : (
                  <Text style={styles.footerLink}>Restore Purchase</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={openTerms}>
                <Text style={styles.footerLink}>Terms of Use (EULA)</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={openPrivacy}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>

          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 64,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerSection: {
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 24,
  },
  mainHeadline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 6,
    zIndex: 10,
  },
  subHeadline: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
    lineHeight: 22,
    zIndex: 10,
  },
  iconSection: {
    alignItems: 'center',
    zIndex: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  iconGlowContainer: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
    overflow: 'hidden',
  },
  appIcon: {
    width: 84,
    height: 84,
    borderRadius: 22,
  },
  purchaseSection: {
    zIndex: 10,
    width: '100%',
  },
  purchaseOverlay: {
    paddingHorizontal: 20,
    paddingTop: 8,
    width: width,
    alignItems: 'center',
    alignSelf: 'center',
  },
  unlockButton: {
    width: '100%',
    marginBottom: 10,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  purchaseOptionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  purchaseOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 96,
  },
  purchaseOptionSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  popularTag: {
    backgroundColor: '#C1FF72',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
  },
  trialTag: {
    backgroundColor: '#C1FF72',
  },
  trialCadence: {
    color: '#C1FF72',
    fontWeight: '600',
  },
  popularTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    lineHeight: 12,
    textAlign: 'center',
  },
  purchaseOptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    textAlign: 'center',
    marginTop: 4,
  },
  purchaseOptionPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 2,
    textAlign: 'center',
  },
  purchaseOptionCadence: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.45)',
    textAlign: 'center',
    marginTop: 2,
  },
  subscriptionFinePrint: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  unlockButtonDisabled: {
    opacity: 0.7,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    flexWrap: 'wrap',
    gap: 2,
  },
  footerLink: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '500',
    textAlign: 'center',
  },
  footerDot: {
    marginHorizontal: 4,
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
  },
  featuresSection: {
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 32,
  },
  featureList: {
    width: '100%',
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureRowText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  featuresScrollContainer: {
    paddingHorizontal: 8,
  },
  featureCard: {
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 132,
    marginRight: 16,
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureCardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureCardDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  featureCardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  featureCardStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  featureCardStatusIcon: {
    fontSize: 14,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    width: 1.5, // Much smaller for subtlety
    height: 1.5, // Much smaller for subtlety
    borderRadius: 0.75, // Smaller radius
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, // Very subtle
    shadowRadius: 1, // Minimal shadow
  },
  star1: {
    top: '15%',
    left: '20%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star2: {
    top: '25%',
    right: '30%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star3: {
    top: '40%',
    left: '10%',
    opacity: 0.5,
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star4: {
    top: '60%',
    right: '15%',
    opacity: 0.4,
    backgroundColor: 'rgba(96, 165, 250, 0.8)',
    shadowColor: 'rgba(96, 165, 250, 0.6)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star5: {
    top: '75%',
    left: '40%',
    opacity: 0.3,
    backgroundColor: 'rgba(168, 85, 247, 0.6)',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star6: {
    top: '85%',
    right: '25%',
    opacity: 0.4,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    shadowColor: 'rgba(59, 130, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star7: {
    top: '35%',
    left: '70%',
    opacity: 0.3,
    backgroundColor: 'rgba(147, 51, 234, 0.6)',
    shadowColor: 'rgba(147, 51, 234, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star8: {
    top: '50%',
    right: '60%',
    opacity: 0.5,
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star9: {
    top: '20%',
    left: '50%',
    opacity: 0.4,
    backgroundColor: 'rgba(96, 165, 250, 0.8)',
    shadowColor: 'rgba(96, 165, 250, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star10: {
    top: '70%',
    left: '80%',
    opacity: 0.3,
    backgroundColor: 'rgba(168, 85, 247, 0.6)',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star11: {
    top: '30%',
    left: '85%',
    opacity: 0.4,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    shadowColor: 'rgba(59, 130, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star12: {
    top: '80%',
    left: '25%',
    opacity: 0.3,
    backgroundColor: 'rgba(147, 51, 234, 0.6)',
    shadowColor: 'rgba(147, 51, 234, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star13: {
    top: '10%',
    left: '10%',
    opacity: 0.4,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.6)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star14: {
    top: '20%',
    right: '20%',
    opacity: 0.3,
    backgroundColor: 'rgba(96, 165, 250, 0.6)',
    shadowColor: 'rgba(96, 165, 250, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star15: {
    top: '40%',
    left: '30%',
    opacity: 0.5,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star16: {
    top: '60%',
    right: '30%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star17: {
    top: '80%',
    left: '40%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star18: {
    top: '90%',
    right: '40%',
    opacity: 0.5,
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star19: {
    top: '5%',
    left: '60%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star20: {
    top: '15%',
    right: '10%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star21: {
    top: '25%',
    left: '80%',
    opacity: 0.4,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star22: {
    top: '45%',
    right: '5%',
    opacity: 0.3,
    backgroundColor: 'rgba(96, 165, 250, 0.6)',
    shadowColor: 'rgba(96, 165, 250, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star23: {
    top: '55%',
    left: '90%',
    opacity: 0.5,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star24: {
    top: '65%',
    right: '45%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star25: {
    top: '75%',
    left: '5%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star26: {
    top: '85%',
    right: '70%',
    opacity: 0.4,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star27: {
    top: '95%',
    left: '70%',
    opacity: 0.3,
    backgroundColor: 'rgba(96, 165, 250, 0.6)',
    shadowColor: 'rgba(96, 165, 250, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star28: {
    top: '8%',
    left: '40%',
    opacity: 0.5,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star29: {
    top: '18%',
    right: '50%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star30: {
    top: '28%',
    left: '15%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star31: {
    top: '38%',
    right: '80%',
    opacity: 0.4,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star32: {
    top: '48%',
    left: '75%',
    opacity: 0.3,
    backgroundColor: 'rgba(96, 165, 250, 0.6)',
    shadowColor: 'rgba(96, 165, 250, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star33: {
    top: '58%',
    right: '15%',
    opacity: 0.5,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star34: {
    top: '68%',
    left: '55%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star35: {
    top: '78%',
    right: '90%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star36: {
    top: '88%',
    left: '25%',
    opacity: 0.5,
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star37: {
    top: '12%',
    left: '85%',
    opacity: 0.4,
    backgroundColor: 'rgba(96, 165, 250, 0.8)',
    shadowColor: 'rgba(96, 165, 250, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star38: {
    top: '22%',
    right: '25%',
    opacity: 0.3,
    backgroundColor: 'rgba(168, 85, 247, 0.6)',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star39: {
    top: '32%',
    left: '45%',
    opacity: 0.5,
    backgroundColor: 'rgba(147, 51, 234, 0.7)',
    shadowColor: 'rgba(147, 51, 234, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star40: {
    top: '42%',
    right: '60%',
    opacity: 0.4,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    shadowColor: 'rgba(59, 130, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star41: {
    top: '52%',
    left: '20%',
    opacity: 0.3,
    backgroundColor: 'rgba(139, 92, 246, 0.6)',
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star42: {
    top: '62%',
    right: '75%',
    opacity: 0.5,
    backgroundColor: 'rgba(96, 165, 250, 0.7)',
    shadowColor: 'rgba(96, 165, 250, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star43: {
    top: '72%',
    left: '65%',
    opacity: 0.4,
    backgroundColor: 'rgba(168, 85, 247, 0.8)',
    shadowColor: 'rgba(168, 85, 247, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star44: {
    top: '82%',
    right: '35%',
    opacity: 0.3,
    backgroundColor: 'rgba(147, 51, 234, 0.6)',
    shadowColor: 'rgba(147, 51, 234, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star45: {
    top: '92%',
    left: '35%',
    opacity: 0.5,
    backgroundColor: 'rgba(59, 130, 246, 0.7)',
    shadowColor: 'rgba(59, 130, 246, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star46: {
    top: '7%',
    left: '30%',
    opacity: 0.4,
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    shadowColor: 'rgba(139, 92, 246, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star47: {
    top: '17%',
    right: '40%',
    opacity: 0.3,
    backgroundColor: 'rgba(96, 165, 250, 0.6)',
    shadowColor: 'rgba(96, 165, 250, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
  star48: {
    top: '27%',
    left: '95%',
    opacity: 0.5,
    backgroundColor: 'rgba(168, 85, 247, 0.7)',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  star49: {
    top: '37%',
    right: '20%',
    opacity: 0.4,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
  },
  star50: {
    top: '47%',
    left: '5%',
    opacity: 0.3,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    width: 1,
    height: 1,
    borderRadius: 0.5,
  },
});

export default NaylProUpgradeScreen;
