import { Image } from 'react-native';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from './authService';
import sessionService from './sessionService';
import nailProgressService, { NailProgressPhoto } from './nailProgressService';
import profileService from './profileService';
import { supabase } from '../lib/supabase';

export const MARKETING_DEMO_EMAIL = 'edwardsjonny547@gmail.com';
export const INVESTOR_DEMO_EMAIL = 'millie@app.com';

const DEMO_ACCOUNT_EMAILS = [
  MARKETING_DEMO_EMAIL,
  INVESTOR_DEMO_EMAIL,
] as const;
const DEMO_STREAK_DAYS = 14;
const SEED_FLAG_KEY = '@marketing_demo_seeded_v2';

const PROGRESS_PHOTO_ASSETS = [
  require('../../assets/progress-photo-examples/pic-1.webp'),
  require('../../assets/progress-photo-examples/pic-2.webp'),
  require('../../assets/progress-photo-examples/pic-3.webp'),
  require('../../assets/progress-photo-examples/pic-4.webp'),
];

const DEMO_PHOTO_SCHEDULE = [
  { daysAgo: 13, daysClean: 1 },
  { daysAgo: 9, daysClean: 5 },
  { daysAgo: 5, daysClean: 9 },
  { daysAgo: 0, daysClean: 14 },
];

class MarketingDemoService {
  async isDemoAccount(): Promise<boolean> {
    const user = await authService.getCurrentUser();
    const email = user?.email?.toLowerCase().trim();
    if (!email) return false;
    return DEMO_ACCOUNT_EMAILS.some((demoEmail) => demoEmail.toLowerCase() === email);
  }

  /** @deprecated Use isDemoAccount */
  async isMarketingDemoAccount(): Promise<boolean> {
    return this.isDemoAccount();
  }

  async applyIfNeeded(): Promise<boolean> {
    if (!(await this.isDemoAccount())) {
      return false;
    }

    try {
      await this.ensureStreakData();
      await this.ensureDemoProfileName();
      await this.seedProgressPhotosIfNeeded();
      await profileService.getProfileData();
      await sessionService.getDashboardData();
      await sessionService.notifySessionDataReady();
      return true;
    } catch (error) {
      console.warn('Marketing demo seed failed:', error);
      return false;
    }
  }

  /** Ensures the nail progress screen always shows all 4 example photos for demo accounts. */
  async getDisplayPhotos(uploadedPhotos: NailProgressPhoto[]): Promise<NailProgressPhoto[]> {
    if (!(await this.isDemoAccount())) {
      return uploadedPhotos;
    }

    const userId = await sessionService.getCurrentUserId();
    const localPhotos = this.buildLocalDemoPhotos(userId);

    if (uploadedPhotos.length >= PROGRESS_PHOTO_ASSETS.length) {
      return [...uploadedPhotos]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, PROGRESS_PHOTO_ASSETS.length);
    }

    const sortedUploads = [...uploadedPhotos].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    const merged = localPhotos.map((localPhoto, index) => sortedUploads[index] ?? localPhoto);
    return merged.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  private buildLocalDemoPhotos(userId: string): NailProgressPhoto[] {
    return PROGRESS_PHOTO_ASSETS.map((asset, index) => {
      const schedule = DEMO_PHOTO_SCHEDULE[index];
      const resolved = Image.resolveAssetSource(asset);
      const createdAt = new Date(Date.now() - schedule.daysAgo * 24 * 60 * 60 * 1000);

      return {
        id: `demo-local-${index}`,
        user_id: userId,
        photo_url: resolved.uri,
        thumbnail_url: resolved.uri,
        days_clean: schedule.daysClean,
        streak_seconds_at_photo: schedule.daysClean * 24 * 60 * 60,
        caption: `Day ${schedule.daysClean} progress`,
        hand_type: 'both' as const,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      };
    });
  }

  private async ensureDemoProfileName(): Promise<void> {
    const user = await authService.getCurrentUser();
    const email = user?.email?.toLowerCase().trim();
    if (email === INVESTOR_DEMO_EMAIL.toLowerCase()) {
      await profileService.updateProfileName('Millie Smith');
    }
  }

  private async ensureStreakData(): Promise<void> {
    const userId = await sessionService.getCurrentUserId();
    const streakSeconds = DEMO_STREAK_DAYS * 24 * 60 * 60;
    const startTime = new Date(Date.now() - streakSeconds * 1000);
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay();
    const successfulDaysThisWeek = Math.min(7, dayOfWeek + 1);

    await sessionService.updateStreakStartTime(startTime);

    await supabase
      .from('user_sessions')
      .update({
        current_streak_seconds: streakSeconds,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    const { data: existingStats } = await supabase
      .from('user_stats')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const statsPayload = {
      consecutive_days: DEMO_STREAK_DAYS,
      total_days_logged_in: DEMO_STREAK_DAYS,
      successful_days_this_week: successfulDaysThisWeek,
      longest_streak_seconds: streakSeconds,
      current_streak_seconds: streakSeconds,
      last_login_date: today,
      updated_at: new Date().toISOString(),
    };

    if (existingStats) {
      await supabase.from('user_stats').update(statsPayload).eq('user_id', userId);
    } else {
      await supabase.from('user_stats').insert({
        user_id: userId,
        total_episodes: 0,
        total_streak_seconds: streakSeconds,
        cumulative_brain_rewiring_seconds: streakSeconds,
        ...statsPayload,
      });
    }

    await sessionService.updateSession(streakSeconds);
  }

  private async seedProgressPhotosIfNeeded(): Promise<void> {
    const userId = await sessionService.getCurrentUserId();
    const seedKey = await sessionService.getUserStorageKey(SEED_FLAG_KEY);

    nailProgressService.invalidateCache();
    const existingPhotos = await nailProgressService.refreshPhotos();

    if (existingPhotos.length >= PROGRESS_PHOTO_ASSETS.length) {
      await AsyncStorage.setItem(seedKey, 'true');
      return;
    }

    for (let i = existingPhotos.length; i < PROGRESS_PHOTO_ASSETS.length; i++) {
      const schedule = DEMO_PHOTO_SCHEDULE[i];
      const asset = Asset.fromModule(PROGRESS_PHOTO_ASSETS[i]);
      await asset.downloadAsync();
      const uri = asset.localUri ?? asset.uri;
      if (!uri) continue;

      const createdAt = new Date(Date.now() - schedule.daysAgo * 24 * 60 * 60 * 1000);
      const streakSeconds = schedule.daysClean * 24 * 60 * 60;

      const photo = await nailProgressService.uploadPhoto({
        uri,
        daysClean: schedule.daysClean,
        streakSeconds,
        handType: 'both',
        caption: `Day ${schedule.daysClean} progress`,
      });

      if (photo) {
        await supabase
          .from('nail_progress_photos')
          .update({ created_at: createdAt.toISOString(), updated_at: createdAt.toISOString() })
          .eq('id', photo.id)
          .eq('user_id', userId);
      }
    }

    nailProgressService.invalidateCache();
    const finalPhotos = await nailProgressService.refreshPhotos();
    if (finalPhotos.length >= PROGRESS_PHOTO_ASSETS.length) {
      await AsyncStorage.setItem(seedKey, 'true');
    }
  }
}

export default new MarketingDemoService();
