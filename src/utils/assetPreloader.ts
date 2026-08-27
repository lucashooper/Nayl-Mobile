import { Asset } from 'expo-asset';
import { Image } from 'react-native';
import { Audio } from 'expo-av';
import profileService from '../services/profileService';
import sessionService from '../services/sessionService';
import marketingDemoService from '../services/marketingDemoService';
import nailProgressService from '../services/nailProgressService';

/** All images loaded during splash — ensures no pop-in after app loads */
const ALL_IMAGE_ASSETS = [
  require('../../assets/cosmic-nail-nobg.webp'),
  require('../../assets/new-flame-icon.webp'),
  require('../../assets/trophy-icon.webp'),
  require('../../assets/cool-orb.webp'),
  require('../../assets/mountain-scene-background.webp'),
  require('../../assets/library-sound-icons/rain-icon.webp'),
  require('../../assets/library-sound-icons/new-sea-icon.webp'),
  require('../../assets/library-sound-icons/new-campfire-icon.webp'),
  require('../../assets/library-sound-icons/white-noise-icon.webp'),
  require('../../assets/recovery-page-icons/increased-confidence.webp'),
  require('../../assets/recovery-page-icons/healthy-nails.webp'),
  require('../../assets/recovery-page-icons/new-meditation-icon.webp'),
  require('../../assets/recovery-page-icons/better-hygiene-icon.webp'),
  require('../../assets/recovery-page-icons/willpower-icon.webp'),
  require('../../assets/bigger-achievement-icons/Sprout-280px.png'),
  require('../../assets/bigger-achievement-icons/Da-Oak-280px.png'),
  require('../../assets/bigger-achievement-icons/Landmark-280px.png'),
  require('../../assets/bigger-achievement-icons/Sun-280px.png'),
  require('../../assets/bigger-achievement-icons/Deeply-Rooted-280px.png'),
  require('../../assets/bigger-achievement-icons/Blossom-280px.png'),
  require('../../assets/cooler-trophy-icon.webp'),
  require('../../assets/relaxation-sounds/campfire-image.jpg'),
  require('../../assets/relaxation-sounds/rain-image.jpg'),
  require('../../assets/see-images-page/bacteria.webp'),
  require('../../assets/see-images-page/damaged-enamel-icon.webp'),
  require('../../assets/see-images-page/anxiety-loop.webp'),
  require('../../assets/onboarding-icons/Nayl-cooler-logo.webp'),
  require('../../assets/onboarding-icons/progress-icon-duotone.png'),
  require('../../assets/onboarding-icons/diary-icon-duotone.png'),
  require('../../assets/onboarding-icons/panic-button-icon-duotone.png'),
  require('../../assets/Nayl-cooler-logo.png'),
  require('../../assets/splash.png'),
];

const AUDIO_ASSETS = [
  require('../../assets/relaxation-sounds/campfire-sounds-short.mp3'),
  require('../../assets/relaxation-sounds/short-rain-sounds.mp3'),
  require('../../assets/relaxation-sounds/ocean-waves.mp3'),
  require('../../assets/relaxation-sounds/white-noise.mp3'),
];

const VIDEO_ASSETS = [
  require('../../assets/meditation-nayl-video.mp4'),
];

/** Full splash preload — everything before first screen */
export async function preloadSplashAssets(): Promise<void> {
  await Asset.loadAsync(ALL_IMAGE_ASSETS);

  await Promise.all(
    ALL_IMAGE_ASSETS.map(async (asset) => {
      try {
        const { uri } = Image.resolveAssetSource(asset);
        if (uri) await Image.prefetch(uri);
      } catch {
        // Non-critical
      }
    }),
  );

  await Promise.all([preloadAudio(), preloadVideos()]);
}

/** Warm dashboard, profile, streak, and photo caches before the home screen mounts */
export async function preloadUserSessionData(): Promise<void> {
  try {
    const hasUser = await sessionService.hasUser();
    if (!hasUser) return;

    await marketingDemoService.applyIfNeeded();

    // Load from disk cache into memory first for instant first paint
    await Promise.all([
      sessionService.getLocalDashboard(),
      profileService.getCachedProfileData(),
    ]);

    // Then refresh from network and prefetch remote images
    await Promise.all([
      sessionService.getDashboardData(),
      profileService.getProfileData(),
      sessionService.getCurrentSession(),
      preloadRemoteProfilePicture(),
      preloadNailProgressPhotos(),
    ]);

    await sessionService.notifySessionDataReady();
  } catch (error) {
    console.warn('Session preload error:', error);
  }
}

async function preloadAudio(): Promise<void> {
  await Promise.all(
    AUDIO_ASSETS.map(async (asset) => {
      try {
        const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: false });
        await sound.unloadAsync();
      } catch {
        // Non-critical
      }
    }),
  );
}

async function preloadVideos(): Promise<void> {
  await Promise.all(
    VIDEO_ASSETS.map(async (asset) => {
      try {
        const videoAsset = Asset.fromModule(asset);
        await videoAsset.downloadAsync();
      } catch {
        // Non-critical
      }
    }),
  );
}

async function preloadRemoteProfilePicture(): Promise<void> {
  try {
    const profile =
      profileService.getMemoryProfile() ?? (await profileService.getCachedProfileData());
    if (profile?.profile_picture_url) {
      await Image.prefetch(profile.profile_picture_url);
    }
  } catch {
    // Non-critical
  }
}

async function preloadNailProgressPhotos(): Promise<void> {
  try {
    const photos = await nailProgressService.getPhotos();
    if (!photos?.length) return;

    await Promise.all(
      photos.slice(0, 10).flatMap((photo) => {
        const urls = [photo.photo_url, photo.thumbnail_url].filter(Boolean) as string[];
        return urls.map((url) => Image.prefetch(url).catch(() => undefined));
      }),
    );
  } catch {
    // Non-critical
  }
}

/** @deprecated Everything loads during splash now */
export function preloadDeferredAssets(): void {
  // No-op
}
