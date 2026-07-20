import AsyncStorage from '@react-native-async-storage/async-storage';
import sessionService, { userStorageKey } from './sessionService';

export const WELCOME_PENDING_KEY = '@nayl_welcome_pending';
export const WELCOME_SHOWN_KEY = '@nayl_welcome_shown';

export async function markWelcomePending(): Promise<void> {
  try {
    const userId = await sessionService.getCurrentUserId();
    await AsyncStorage.setItem(userStorageKey(WELCOME_PENDING_KEY, userId), 'true');
  } catch {
    await AsyncStorage.setItem(WELCOME_PENDING_KEY, 'true');
  }
}

export async function shouldShowWelcome(): Promise<boolean> {
  try {
    const userId = await sessionService.getCurrentUserId();
    const shownKey = userStorageKey(WELCOME_SHOWN_KEY, userId);
    const pendingKey = userStorageKey(WELCOME_PENDING_KEY, userId);

    const [shown, pending] = await Promise.all([
      AsyncStorage.getItem(shownKey),
      AsyncStorage.getItem(pendingKey),
    ]);

    return pending === 'true' && shown !== 'true';
  } catch {
    const pending = await AsyncStorage.getItem(WELCOME_PENDING_KEY);
    const shown = await AsyncStorage.getItem(WELCOME_SHOWN_KEY);
    return pending === 'true' && shown !== 'true';
  }
}

export async function markWelcomeShown(): Promise<void> {
  try {
    const userId = await sessionService.getCurrentUserId();
    const shownKey = userStorageKey(WELCOME_SHOWN_KEY, userId);
    const pendingKey = userStorageKey(WELCOME_PENDING_KEY, userId);
    await AsyncStorage.multiSet([
      [shownKey, 'true'],
      [pendingKey, 'false'],
    ]);
  } catch {
    await AsyncStorage.multiSet([
      [WELCOME_SHOWN_KEY, 'true'],
      [WELCOME_PENDING_KEY, 'false'],
    ]);
  }
}
