import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, DeviceEventEmitter } from 'react-native';
import { useThemeGuaranteed } from '../context/ThemeContext';
import profileService, { PROFILE_UPDATED } from '../services/profileService';
import { USER_SESSION_CHANGED } from '../services/sessionService';

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed === 'Your Name') return '?';

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

interface ProfileHeaderProps {
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  navigation?: any;
  showName?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  size = 'medium',
  onPress,
  navigation,
  showName = false
}) => {
  const themeResult = useThemeGuaranteed();
  const colors = themeResult?.colors;
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>('Your Name');
  const [isLoading, setIsLoading] = useState(true);

  const loadProfilePicture = async () => {
    try {
      const cached = await profileService.getCachedProfileData();
      if (cached) {
        setProfilePictureUrl(cached.profile_picture_url || null);
        setProfileName(cached.profile_name || 'Your Name');
        setIsLoading(false);
      }

      const profileData = await profileService.getProfileData();
      setProfilePictureUrl(profileData.profile_picture_url || null);
      setProfileName(profileData.profile_name || 'Your Name');
    } catch (error) {
      console.error('Error loading profile picture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfilePicture();

    const sessionSubscription = DeviceEventEmitter.addListener(USER_SESSION_CHANGED, loadProfilePicture);
    const profileSubscription = DeviceEventEmitter.addListener(
      PROFILE_UPDATED,
      (payload?: { profile_name?: string; profile_picture_url?: string }) => {
        if (payload?.profile_name) {
          setProfileName(payload.profile_name);
        }
        if (payload?.profile_picture_url !== undefined) {
          setProfilePictureUrl(payload.profile_picture_url || null);
        }
        if (!payload?.profile_name && payload?.profile_picture_url === undefined) {
          loadProfilePicture();
        }
        setIsLoading(false);
      },
    );

    return () => {
      sessionSubscription.remove();
      profileSubscription.remove();
    };
  }, []);

  // Enhanced safety check for theme colors
  if (!colors || 
      typeof colors !== 'object' || 
      !colors.primaryBackground || 
      !colors.primaryText ||
      !colors.primaryAccent) {
    console.warn('⚠️ ProfileHeader: Theme colors not ready, using fallback');
    return (
      <View style={{ 
        height: 120, 
        backgroundColor: '#2A2A2A', 
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'large':
        return { width: 48, height: 48, borderRadius: 24 };
      default: // medium
        return { width: 40, height: 40, borderRadius: 20 };
    }
  };

  const sizeStyles = getSizeStyles();

  const initialsFontSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;

  const renderProfileContent = () => {
    if (profilePictureUrl) {
      return (
        <Image 
          source={{ uri: profilePictureUrl }} 
          style={[styles.profileImage, sizeStyles]}
          resizeMode="cover"
          fadeDuration={0}
        />
      );
    }

    return (
      <View style={[styles.initialsAvatar, sizeStyles, { backgroundColor: colors.primaryAccent }]}>
        <Text style={[styles.initialsText, { fontSize: initialsFontSize }]}>
          {isLoading ? '…' : getInitials(profileName)}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.wrapper} 
      onPress={onPress || (() => navigation?.navigate('Profile'))}
      activeOpacity={0.8}
    >
      <View style={[styles.container, sizeStyles]}>
        {renderProfileContent()}
      </View>
      {showName && (
        <Text style={styles.profileName} numberOfLines={1}>
          {profileName}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initialsAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  initialsText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  profileImage: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    opacity: 0.3,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    maxWidth: 120,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ProfileHeader;
