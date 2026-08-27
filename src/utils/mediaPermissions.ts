import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export async function openPhotoLibraryPicker(options: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: options.allowsEditing ?? Platform.OS === 'ios',
    aspect: options.aspect ?? [1, 1],
    quality: options.quality ?? 0.8,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    const permission = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!permission.granted && !permission.canAskAgain) {
      promptOpenSettings(
        'Photo Library Access',
        'To choose photos, enable Photo Library access for Nayl in Settings.',
      );
    }
    return null;
  }

  return result.assets[0].uri;
}

export async function openCameraCapture(options: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<string | null> {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: options.allowsEditing ?? Platform.OS === 'ios',
    aspect: options.aspect ?? [1, 1],
    quality: options.quality ?? 0.8,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    const permission = await ImagePicker.getCameraPermissionsAsync();
    if (!permission.granted && !permission.canAskAgain) {
      promptOpenSettings(
        'Camera Access',
        'To take progress photos, enable Camera access for Nayl in Settings.',
      );
    }
    return null;
  }

  return result.assets[0].uri;
}

function promptOpenSettings(title: string, message: string): void {
  Alert.alert(title, message, [
    { text: 'Not Now', style: 'cancel' },
    { text: 'Open Settings', onPress: () => Linking.openSettings() },
  ]);
}
