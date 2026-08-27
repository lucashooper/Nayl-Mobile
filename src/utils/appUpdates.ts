/**
 * Check for an OTA update and reload if needed.
 * Call only during the initial boot sequence — before the main UI is shown —
 * so the user never sees a second loading flash.
 */
export async function applyPendingUpdateIfAvailable(): Promise<void> {
  if (__DEV__) {
    return;
  }

  try {
    const Updates = await import('expo-updates');
    if (!Updates.isEnabled) {
      return;
    }

    const update = await Updates.checkForUpdateAsync();
    if (!update.isAvailable) {
      return;
    }

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  } catch {
    // Native module missing, offline, or update server unavailable — use embedded bundle.
  }
}
