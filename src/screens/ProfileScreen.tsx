import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, TextInput, Linking, DeviceEventEmitter, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAchievements } from '../context/AchievementContext';
import { TYPOGRAPHY, SPACING } from '../constants/theme';
import profileService, { ProfileData } from '../services/profileService';
import sessionService, { USER_SESSION_CHANGED } from '../services/sessionService';
import authService from '../services/authService';
import iapService from '../services/iapService';
import { openCameraCapture, openPhotoLibraryPicker } from '../utils/mediaPermissions';

import { PRIVACY_POLICY_URL, SUPPORT_URL, TERMS_URL } from '../constants/legalUrls';
import BackButton from '../components/BackButton';

type ProfileStackParamList = {
  ProfileMain: undefined;
  Reasons: undefined;
  TriggerHistory: undefined;
};

interface ProfileScreenProps {
  navigation: NavigationProp<ProfileStackParamList>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { colors, isReady, currentTheme, setTheme } = useTheme();
  const { unlockedAchievements } = useAchievements();
  const insets = useSafeAreaInsets();
  
  // Profile data state
  const bootProfile = profileService.getMemoryProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    profile_name: bootProfile?.profile_name || 'Your Name',
    longest_streak_seconds: bootProfile?.longest_streak_seconds || 0,
    consecutive_days: bootProfile?.consecutive_days || 0,
    total_days_logged_in: bootProfile?.total_days_logged_in || 0,
  });
  const [profileImage, setProfileImage] = useState<string | null>(
    bootProfile?.profile_picture_url ?? null,
  );
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [showNameEditModal, setShowNameEditModal] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Star animation state (like HomeScreen)
  const [starPositions, setStarPositions] = useState(() => 
    Array.from({ length: 60 }, () => ({
      x: Math.random() * 400,
      y: Math.random() * 800,
      opacity: Math.random() * 0.6 + 0.15,
      speed: Math.random() * 0.15 + 0.03,
      directionX: (Math.random() - 0.5) * 1.5,
      directionY: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2.5 + 0.6,
    }))
  );

  const solidCardStyle = {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden' as const,
    ...(Platform.OS === 'android'
      ? { elevation: 0, shadowOpacity: 0, shadowRadius: 0 }
      : {}),
  };
  
  // Check if theme context is ready
  if (!isReady || !colors) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18 }}>Loading theme...</Text>
      </View>
    );
  }

  // Star animation effect (like HomeScreen)
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setStarPositions(prevStars => 
        prevStars.map(star => {
          let newX = star.x + star.directionX * star.speed;
          let newY = star.y + star.directionY * star.speed;
          
          // Wrap around screen edges
          if (newX > 400) newX = 0;
          if (newX < 0) newX = 400;
          if (newY > 800) newY = 0;
          if (newY < 0) newY = 800;
          
          return {
            ...star,
            x: newX,
            y: newY,
          };
        })
      );
    }, 50);
    
    return () => clearInterval(animationInterval);
  }, []);

  // Load basic profile data on mount — cache first via layout effect
  useLayoutEffect(() => {
    loadBasicProfileData();
    loadAccountInfo();
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      USER_SESSION_CHANGED,
      (userId: string | null) => {
        if (!userId) {
          setProfileData({
            profile_name: 'Your Name',
            longest_streak_seconds: 0,
            consecutive_days: 0,
            total_days_logged_in: 0,
          });
          setProfileImage(null);
          setAccountEmail(null);
          setAuthProvider(null);
        } else {
          loadBasicProfileData();
          loadAccountInfo();
        }
      },
    );

    return () => subscription.remove();
  }, []);

  const loadAccountInfo = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        setAccountEmail(null);
        setAuthProvider(null);
        return;
      }

      setAccountEmail(user.email ?? null);

      const provider =
        user.app_metadata?.provider ??
        user.identities?.[0]?.provider ??
        null;
      if (provider === 'google') {
        setAuthProvider('Google');
      } else if (provider === 'apple') {
        setAuthProvider('Apple');
      } else {
        setAuthProvider(provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Email');
      }
    } catch (error) {
      console.error('Error loading account info:', error);
    }
  };

  const loadBasicProfileData = async () => {
    try {
      const cached = await profileService.getCachedProfileData();
      if (cached) {
        setProfileData({
          profile_name: cached.profile_name || 'Your Name',
          longest_streak_seconds: cached.longest_streak_seconds || 0,
          consecutive_days: cached.consecutive_days || 0,
          total_days_logged_in: cached.total_days_logged_in || 0,
        });
        if (cached.profile_picture_url) {
          setProfileImage(cached.profile_picture_url);
        }
      }

      const existingProfile = await profileService.getProfileData();
      if (existingProfile) {
        setProfileData({
          profile_name: existingProfile.profile_name || 'Your Name',
          longest_streak_seconds: existingProfile.longest_streak_seconds || 0,
          consecutive_days: existingProfile.consecutive_days || 0,
          total_days_logged_in: existingProfile.total_days_logged_in || 0
        });
        
        if (existingProfile.profile_picture_url) {
          setProfileImage(existingProfile.profile_picture_url);
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const pickImage = async () => {
    try {
      const uri = await openPhotoLibraryPicker({
        allowsEditing: Platform.OS === 'ios',
        aspect: [1, 1],
        quality: 0.8,
      });
      if (uri) {
        await handleImageUpload(uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const uri = await openCameraCapture({
        allowsEditing: Platform.OS === 'ios',
        aspect: [1, 1],
        quality: 0.8,
      });
      if (uri) {
        await handleImageUpload(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleImageUpload = async (imageUri: string) => {
    try {
      setIsLoading(true);
      
      // Upload image to Supabase
      const uploadedUrl = await profileService.uploadProfilePicture(imageUri);
      
      // Update profile picture in database
      await profileService.updateProfilePicture(uploadedUrl);
      
      // Update local state
      setProfileImage(uploadedUrl);
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Upload Failed', `Failed to upload image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfileName = async () => {
    try {
      if (editingName && editingName.trim()) {
        const trimmedName = editingName.trim();
        
        // Save to database via profileService
        await profileService.updateProfileName(trimmedName);
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          profile_name: trimmedName
        }));
        
        // Close modal
        setShowNameEditModal(false);
        setEditingName('');
        
        Alert.alert('Success', 'Profile name updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile name:', error);
      Alert.alert('Error', 'Failed to update profile name. Please try again.');
    }
  };

  const resetToOnboarding = () => {
    navigation.getParent()?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Home',
            state: {
              index: 0,
              routes: [{ name: 'Onboarding' }],
            },
          },
        ],
      }),
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This permanently deletes your account, streak data, journal entries, and progress photos. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'All of your Nayl data will be permanently removed.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setIsDeletingAccount(true);
                      await authService.deleteAccount();
                      await iapService.logOut();
                      resetToOnboarding();
                    } catch (error) {
                      console.error('Account deletion error:', error);
                      Alert.alert('Error', 'Could not delete your account. Please try again or contact support@nayl.app.');
                    } finally {
                      setIsDeletingAccount(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? Your local data will remain on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);

              try {
                await iapService.logOut();
              } catch (iapError) {
                console.warn('IAP logout skipped:', iapError);
              }

              await sessionService.logout();
              profileService.clearMemoryCache();

              try {
                await authService.signOut();
              } catch (authError) {
                console.warn('Auth sign-out skipped:', authError);
              }

              resetToOnboarding();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Logout Error', 'Could not log out. Please try again or restart the app.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) {
      return '0m';
    }
    
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${totalSeconds}s`;
    }
  };
  
  return (
    <View style={{ flex: 1 }}>
      {/* Premium Background with Gradient - EXACTLY like HomeScreen */}
      <LinearGradient
        colors={colors.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.55, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1, // Ensure it's behind all content
        }}
      />
      
      {/* Starfield Animation - Smooth like HomeScreen */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
        {starPositions.map((star, index) => (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: star.size / 2,
              opacity: star.opacity * 0.4,
              shadowColor: 'rgba(255, 255, 255, 0.2)',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 1,
              elevation: 1,
            }}
          />
        ))}
      </View>

      {/* Header */}
      <View style={{ 
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        paddingTop: insets.top + 20,
        zIndex: 10,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: SPACING.md,
          position: 'relative',
        }}>
          {/* Back button positioned absolutely on the left */}
          <View style={{
            position: 'absolute',
            left: 0,
          }}>
            <BackButton onPress={() => navigation.navigate('Home' as never)} color={colors.primaryText} />
          </View>
          
          {/* Centered title */}
          <Text style={{
            ...TYPOGRAPHY.headingLarge,
            color: colors.primaryText,
            textAlign: 'center',
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}>Profile</Text>
        </View>
      </View>

      {/* Profile Content */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Profile Info */}
        <View style={{ alignItems: 'center', paddingVertical: SPACING.lg }}>
          {/* Profile Image */}
          <TouchableOpacity 
            style={{ marginBottom: SPACING.sm }}
            onPress={pickImage}
          >
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={{ 
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 4,
                  borderColor: colors.glassBorder,
                }}
                fadeDuration={0}
              />
            ) : (
              <View style={{ 
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: colors.cardBackground,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: colors.glassBorder,
              }}>
                <Ionicons name="person" size={48} color={colors.secondaryText} />
              </View>
            )}
            <View style={{ 
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>

            {isLoading && (
              <View style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.overlayBackground,
                borderRadius: 60,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="cloud-upload" size={24} color={colors.primaryText} />
                <Text style={{ 
                  color: colors.primaryText,
                  fontSize: 12,
                  fontWeight: '500',
                  marginTop: SPACING.xs,
                }}>Uploading...</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={takePhoto}
            style={{ marginBottom: SPACING.lg }}
            accessibilityRole="button"
            accessibilityLabel="Take profile photo with camera"
          >
            <Text style={{ color: colors.secondaryText, fontSize: 13, textAlign: 'center' }}>
              Or take a photo with camera
            </Text>
          </TouchableOpacity>
          
          {/* Profile Name - Now Editable */}
          <TouchableOpacity 
            onPress={() => {
              setEditingName(profileData.profile_name);
              setShowNameEditModal(true);
            }}
          >
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: SPACING.xs,
            }}>
              <Text style={{ 
                fontSize: 28,
                fontWeight: '700',
                color: colors.primaryText,
                textAlign: 'center',
              }}>{profileData.profile_name}</Text>
              
              {/* Subtle pen icon for editing */}
              <Ionicons 
                name="pencil" 
                size={16} 
                color={colors.secondaryText} 
                style={{ 
                  marginLeft: SPACING.xs,
                  opacity: 0.6,
                }} 
              />
            </View>
          </TouchableOpacity>
          
          {/* Login Streak Display */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: SPACING.sm,
          }}>
            <Image 
              source={require('../../assets/new-flame-icon.webp')}
              style={{ 
                width: 16,
                height: 16,
                marginRight: SPACING.xs,
              }}
              fadeDuration={0}
            />
            <Text style={{ 
              fontSize: 16,
              color: '#FF6B35',
              fontWeight: '600',
              textAlign: 'center',
            }}>
              {`${profileData.consecutive_days} day login streak`}
            </Text>
          </View>
        </View>

        {/* Basic Stats */}
        <View style={{ flexDirection: 'row', marginBottom: SPACING.xl, gap: SPACING.md }}>
          <View style={{ 
            flex: 1,
            ...solidCardStyle,
            borderRadius: SPACING.md,
            padding: SPACING.md,
            alignItems: 'center',
          }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: SPACING.xs,
            }}>
              <Text style={{ 
                fontSize: 24,
                fontWeight: '700',
                color: colors.primaryText,
                marginRight: SPACING.xs,
              }}>{profileData.consecutive_days}</Text>
              <Image 
                source={require('../../assets/new-flame-icon.webp')}
                style={{ 
                  width: 20,
                  height: 20,
                }}
                fadeDuration={0}
              />
            </View>
            <Text style={{ 
              fontSize: 14,
              color: colors.secondaryText,
              textAlign: 'center',
            }}>Consecutive Days</Text>
          </View>
          
          <View style={{ 
            flex: 1,
            ...solidCardStyle,
            borderRadius: SPACING.md,
            padding: SPACING.md,
            alignItems: 'center',
          }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: SPACING.xs,
            }}>
              <Text style={{ 
                fontSize: 24,
                fontWeight: '700',
                color: colors.primaryText,
                marginRight: SPACING.xs,
              }}>{profileData.total_days_logged_in}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ 
              fontSize: 14,
              color: colors.secondaryText,
              textAlign: 'center',
            }}>Total Days</Text>
          </View>
        </View>

        {/* Account — visible for App Review (Guideline 5.1.1v) */}
        <View style={{ marginBottom: SPACING.xl }}>
          <Text style={{
            fontSize: 20,
            color: colors.primaryText,
            fontWeight: '600',
            marginBottom: SPACING.md,
          }}>Account</Text>

          <View style={{
            padding: SPACING.lg,
            ...solidCardStyle,
            borderRadius: SPACING.md,
            marginBottom: SPACING.sm,
          }}>
            {accountEmail ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: SPACING.md,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}>
                  <Ionicons name="mail-outline" size={20} color={colors.primaryText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: colors.secondaryText, marginBottom: 2 }}>
                    Signed in with {authProvider ?? 'your account'}
                  </Text>
                  <Text style={{ fontSize: 16, color: colors.primaryText, fontWeight: '600' }}>
                    {accountEmail}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={{ fontSize: 14, color: colors.secondaryText, lineHeight: 20 }}>
                Your streak, journal, and progress are linked to your Nayl account on this device.
              </Text>
            )}
          </View>
        </View>

        {/* Complex Streak Card with Gradients */}
        <View style={{ 
          marginBottom: SPACING.lg,
          borderRadius: SPACING.lg,
          overflow: 'hidden',
          ...(Platform.OS === 'android'
            ? { elevation: 0, shadowOpacity: 0 }
            : {
                elevation: 8,
                shadowColor: colors.primaryAccent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }),
        }}>
          <LinearGradient
            colors={[
              'rgba(242, 0, 255, 0.95)',
              'rgba(200, 20, 120, 0.9)',
              'rgba(160, 40, 80, 0.9)',
              'rgba(220, 20, 60, 0.9)'
            ]}
            style={{ padding: SPACING.lg, borderRadius: SPACING.lg, overflow: 'hidden' }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0, 0.3, 0.7, 1]}
          >
            <View style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: SPACING.sm,
            }}>
              <View style={{ 
                width: 64,
                height: 64,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: SPACING.md,
              }}>
                <Image 
                  source={require('../../assets/cooler-trophy-icon.webp')}
                  style={{ width: 64, height: 64, resizeMode: 'contain' }}
                  fadeDuration={0}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 24,
                  color: colors.primaryText,
                  fontWeight: '800',
                  marginBottom: SPACING.xs,
                  textShadowColor: 'rgba(0, 0, 0, 0.4)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                  letterSpacing: 0.5,
                }}>Longest Streak</Text>
                <Text style={{ 
                  fontSize: 32,
                  color: '#FFD700',
                  fontWeight: '900',
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                  letterSpacing: 1,
                }}>
                  {formatTime(profileData.longest_streak_seconds)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Unlocked Achievements Row */}
        <View style={{ 
          marginBottom: SPACING.xl,
          paddingVertical: SPACING.lg,
        }}>
          <Text style={{ 
            fontSize: 18,
            color: colors.primaryText,
            fontWeight: '600',
            marginBottom: SPACING.md,
            textAlign: 'center',
          }}>
            Your Achievements
          </Text>
          
          <View style={{ 
            alignItems: 'center',
            paddingHorizontal: SPACING.md,
          }}>
            {unlockedAchievements && Array.isArray(unlockedAchievements) && unlockedAchievements.length > 0 ? (
              <View style={{ 
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: SPACING.md,
              }}>
                {unlockedAchievements.map((achievement, index) => {
                  // Safety checks for achievement data
                  if (!achievement || typeof achievement !== 'object') {
                    return null;
                  }
                  
                  if (!achievement.id || !achievement.title) {
                    return null;
                  }
                  
                  return (
                    <View key={achievement.id || index} style={{ 
                      alignItems: 'center',
                      minWidth: 80,
                    }}>
                      {achievement.iconSource ? (
                        <Image 
                          source={achievement.iconSource}
                          style={{ 
                            width: 60, 
                            height: 60,
                            resizeMode: 'contain',
                            marginBottom: SPACING.xs,
                          }}
                          fadeDuration={0}
                        />
                      ) : (
                        <Text style={{ 
                          fontSize: 48,
                          marginBottom: SPACING.xs,
                        }}>
                          {achievement.icon && typeof achievement.icon === 'string' ? achievement.icon : '🏆'}
                        </Text>
                      )}
                      <Text style={{ 
                        fontSize: 12,
                        color: colors.secondaryText,
                        textAlign: 'center',
                        fontWeight: '500',
                      }}>
                        {achievement.title}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={{ 
                alignItems: 'center',
                paddingVertical: SPACING.lg,
              }}>
                <Text style={{ 
                  fontSize: 16,
                  color: colors.secondaryText,
                  textAlign: 'center',
                  opacity: 0.7,
                }}>
                  Complete your first day to unlock achievements!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Reasons for Changing Card */}
        <View style={{ marginBottom: SPACING.lg, borderRadius: SPACING.lg, overflow: 'hidden' }}>
          <LinearGradient
            colors={[colors.cardBackground, colors.secondaryBackground]}
            style={{ padding: SPACING.lg }}
          >
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.navigate('Reasons')}
            >
              <View style={{ 
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(147, 51, 234, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: SPACING.md,
                borderWidth: 1,
                borderColor: 'rgba(147, 51, 234, 0.3)',
              }}>
                <Ionicons name="heart" size={32} color="#9333EA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 18,
                  color: colors.primaryText,
                  fontWeight: '600',
                  marginBottom: SPACING.xs,
                }}>Reasons for Changing</Text>
                <Text style={{ 
                  fontSize: 14,
                  color: colors.secondaryText,
                }}>
                  Add your personal reasons for stopping nail biting
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.secondaryText} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Profile Options */}
        <View style={{ marginTop: SPACING.xl }}>
          <TouchableOpacity style={{ 
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.lg,
            ...solidCardStyle,
            borderRadius: SPACING.md,
            marginBottom: SPACING.sm,
          }}
          onPress={() => navigation.navigate('TriggerHistory')}
          >
            <View style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <Ionicons name="book-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ 
              fontSize: 16,
              color: colors.primaryText,
              fontWeight: '500',
              flex: 1,
            }}>Journal</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.md,
              paddingHorizontal: SPACING.lg,
              ...solidCardStyle,
              borderRadius: SPACING.md,
              marginBottom: SPACING.sm,
            }}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          >
            <View style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <Ionicons name="shield-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ 
              fontSize: 16,
              color: colors.primaryText,
              fontWeight: '500',
              flex: 1,
            }}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.md,
              paddingHorizontal: SPACING.lg,
              ...solidCardStyle,
              borderRadius: SPACING.md,
              marginBottom: SPACING.sm,
            }}
            onPress={() => Linking.openURL(TERMS_URL)}
          >
            <View style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <Ionicons name="document-text-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ 
              fontSize: 16,
              color: colors.primaryText,
              fontWeight: '500',
              flex: 1,
            }}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.md,
              paddingHorizontal: SPACING.lg,
              ...solidCardStyle,
              borderRadius: SPACING.md,
              marginBottom: SPACING.sm,
            }}
            onPress={() => Linking.openURL(SUPPORT_URL)}
          >
            <View style={{ 
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <Ionicons name="help-circle-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ 
              fontSize: 16,
              color: colors.primaryText,
              fontWeight: '500',
              flex: 1,
            }}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        {/* Theme Switcher Section */}
        <View style={{ marginTop: SPACING.xl, marginBottom: SPACING.lg }}>
          <Text style={{ 
            fontSize: 20,
            color: colors.primaryText,
            fontWeight: '600',
            marginBottom: SPACING.md,
          }}>Appearance</Text>
          
          <View style={{ gap: SPACING.md }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: SPACING.md,
                backgroundColor: currentTheme === 'midnight' ? colors.primaryAccent + '20' : '#0F172A',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: currentTheme === 'midnight' ? colors.primaryAccent : 'rgba(255, 255, 255, 0.14)',
              }}
              onPress={() => setTheme('midnight')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ 
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: SPACING.md,
                  borderWidth: 2,
                  borderColor: colors.glassBorder,
                  backgroundColor: colors.primaryBackground,
                }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16,
                    color: colors.primaryText,
                    fontWeight: '600',
                    marginBottom: SPACING.xs,
                  }}>Midnight</Text>
                  <Text style={{ 
                    fontSize: 14,
                    color: colors.secondaryText,
                  }}>Premium dark depth</Text>
                </View>
              </View>
              {currentTheme === 'midnight' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primaryAccent} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: SPACING.md,
                backgroundColor: currentTheme === 'twilight' ? colors.primaryAccent + '20' : '#0F172A',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: currentTheme === 'twilight' ? colors.primaryAccent : 'rgba(255, 255, 255, 0.14)',
              }}
              onPress={() => setTheme('twilight')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ 
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: SPACING.md,
                  borderWidth: 2,
                  borderColor: colors.glassBorder,
                  backgroundColor: colors.primaryBackground,
                }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16,
                    color: colors.primaryText,
                    fontWeight: '600',
                    marginBottom: SPACING.xs,
                  }}>Twilight</Text>
                  <Text style={{ 
                    fontSize: 14,
                    color: colors.secondaryText,
                  }}>Subtle dark blue</Text>
                </View>
              </View>
              {currentTheme === 'twilight' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primaryAccent} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Account actions — pinned to bottom of profile */}
        <View style={{ marginTop: SPACING.xl, marginBottom: SPACING.xxxl }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.md,
              paddingHorizontal: SPACING.lg,
              ...solidCardStyle,
              borderRadius: SPACING.md,
              marginBottom: SPACING.sm,
            }}
            onPress={handleLogout}
            disabled={isLoggingOut || isDeletingAccount}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <Ionicons name="log-out-outline" size={20} color={colors.primaryText} />
            </View>
            <Text style={{ fontSize: 16, color: colors.primaryText, fontWeight: '500', flex: 1 }}>
              {isLoggingOut ? 'Logging out…' : 'Log Out'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.md,
              paddingHorizontal: SPACING.lg,
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              borderRadius: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.25)',
            }}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount || isLoggingOut}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </View>
            <Text style={{ fontSize: 16, color: '#EF4444', fontWeight: '600', flex: 1 }}>
              {isDeletingAccount ? 'Deleting account…' : 'Delete Account'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>


      </ScrollView>

      {/* Custom Name Edit Modal */}
      {showNameEditModal && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <View style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderRadius: SPACING.lg,
            padding: SPACING.xl,
            marginHorizontal: SPACING.lg,
            width: '85%',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: SPACING.lg,
            }}>
              Edit Profile Name
            </Text>
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: SPACING.md,
                padding: SPACING.md,
                fontSize: 16,
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                marginBottom: SPACING.lg,
                textAlign: 'center',
              }}
              value={editingName}
              onChangeText={setEditingName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              autoFocus
            />
            
            <View style={{
              flexDirection: 'row',
              gap: SPACING.md,
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: SPACING.md,
                  paddingHorizontal: SPACING.lg,
                  borderRadius: SPACING.md,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
                onPress={() => {
                  setShowNameEditModal(false);
                  setEditingName('');
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'center',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: SPACING.md,
                  paddingHorizontal: SPACING.lg,
                  borderRadius: SPACING.md,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
                onPress={handleSaveProfileName}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfileScreen;
