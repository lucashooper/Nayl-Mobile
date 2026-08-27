import * as Updates from 'expo-updates';

/**
 * Check for an OTA update and reload if needed.
 * Call only during the initial boot sequence — before the main UI is shown —
 * so the user never sees a second loading flash.
 */
export async function applyPendingUpdateIfAvailable(): Promise<void> {
  if (__DEV__ || !Updates.isEnabled) {
    return;
  }

  try {
    const update = await Updates.checkForUpdateAsync();
    if (!update.isAvailable) {
      return;
    }

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  } catch {
    // Offline or update server unavailable — continue with the embedded bundle.
  }
}
