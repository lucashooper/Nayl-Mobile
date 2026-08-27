import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { openCameraCapture, openPhotoLibraryPicker } from '../utils/mediaPermissions';
import { useThemeGuaranteed } from '../context/ThemeContext';
import { useStreak } from '../context/StreakContext';
import nailProgressService, { NailProgressPhoto } from '../services/nailProgressService';
import marketingDemoService from '../services/marketingDemoService';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';
import { SPACING, TYPOGRAPHY } from '../constants/theme';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - SPACING.lg * 3) / 2;

interface NailProgressScreenProps {
  navigation: any;
}

const NailProgressScreen: React.FC<NailProgressScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeGuaranteed();
  const { elapsedSeconds } = useStreak();

  const bootPhotos = nailProgressService.getMemoryPhotos();
  const [photos, setPhotos] = useState<NailProgressPhoto[]>(bootPhotos ?? []);
  const [isLoading, setIsLoading] = useState(bootPhotos === null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<NailProgressPhoto | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const daysClean = Math.floor(elapsedSeconds / (24 * 60 * 60));

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const data = await nailProgressService.getPhotos();
      const displayPhotos = await marketingDemoService.getDisplayPhotos(data);
      setPhotos(displayPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const uri = await openCameraCapture({
        allowsEditing: Platform.OS === 'ios',
        aspect: [4, 3],
        quality: 0.8,
      });
      if (uri) {
        await uploadPhoto(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickFromGallery = async () => {
    try {
      const uri = await openPhotoLibraryPicker({
        allowsEditing: Platform.OS === 'ios',
        aspect: [4, 3],
        quality: 0.8,
      });
      if (uri) {
        await uploadPhoto(uri);
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to pick photo');
    }
  };

  const uploadPhoto = async (uri: string) => {
    try {
      setIsUploading(true);
      
      const photo = await nailProgressService.uploadPhoto({
        uri,
        daysClean,
        streakSeconds: elapsedSeconds,
        handType: 'both',
      });

      if (photo) {
        await hapticService.trigger(HapticType.SUCCESS, HapticIntensity.PROMINENT);
        await loadPhotos();
        Alert.alert('Success!', 'Your progress photo has been saved 📸');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
      await hapticService.trigger(HapticType.ERROR, HapticIntensity.NORMAL);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPhoto = () => {
    pickFromGallery();
  };

  const handlePhotoPress = (photo: NailProgressPhoto) => {
    hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
    setSelectedPhoto(photo);
  };

  const handleDeletePhoto = async (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this progress photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await nailProgressService.deletePhoto(photoId);
            if (success) {
              await hapticService.trigger(HapticType.SUCCESS, HapticIntensity.NORMAL);
              setSelectedPhoto(null);
              await loadPhotos();
            } else {
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  };

  const showComparisonView = async () => {
    if (photos.length < 2) {
      Alert.alert('Not enough photos', 'You need at least 2 photos to compare progress');
      return;
    }

    await hapticService.trigger(HapticType.LIGHT_TAP, HapticIntensity.SUBTLE);
    setShowComparison(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderPhotoGrid = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryAccent} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
            Loading your progress...
          </Text>
        </View>
      );
    }

    if (photos.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="camera-outline" size={80} color={colors.secondaryText} />
          <Text style={[styles.emptyTitle, { color: colors.primaryText }]}>
            No Progress Photos Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
            Start tracking your nail healing journey!
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.photoGrid}>
        {photos.map((photo) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoCard}
            onPress={() => handlePhotoPress(photo)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: photo.thumbnail_url || photo.photo_url }}
              style={styles.photoImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.photoOverlay}
            >
              <View style={styles.photoInfo}>
                <Text style={styles.photoDays}>Day {photo.days_clean}</Text>
                <Text style={styles.photoDate}>{formatDate(photo.created_at)}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryBackground }]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>
          Nail Progress
        </Text>
        {photos.length >= 2 && (
          <TouchableOpacity onPress={showComparisonView}>
            <Ionicons name="git-compare" size={24} color={colors.primaryAccent} />
          </TouchableOpacity>
        )}
        {photos.length < 2 && <View style={{ width: 24 }} />}
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <LinearGradient
          colors={['rgba(193, 255, 114, 0.15)', 'rgba(193, 255, 114, 0.05)']}
          style={styles.statsGradient}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primaryAccent }]}>
                {photos.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                Photos
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primaryAccent }]}>
                {daysClean}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                Days Clean
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Photo Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderPhotoGrid()}
      </ScrollView>

      {/* Add Photo Button */}
      <View style={[styles.addButtonContainer, { bottom: insets.bottom + 20 }]}>
        <View style={styles.addButtonRow}>
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonSecondary]}
            onPress={takePhoto}
            disabled={isUploading}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={22} color={colors.primaryText} />
            <Text style={[styles.addButtonTextSecondary, { color: colors.primaryText }]}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPhoto}
            disabled={isUploading}
            activeOpacity={0.8}
          >
          <LinearGradient
            colors={['#C1FF72', '#9FE855', '#7DD138']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <>
                <Ionicons name="images" size={24} color="#000000" />
                <Text style={styles.addButtonText}>Gallery</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        </View>
      </View>

      {/* Photo Detail Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedPhoto(null)}
          />
          {selectedPhoto && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedPhoto.photo_url }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <View style={[styles.modalInfo, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={[styles.modalTitle, { color: colors.primaryText }]}>
                      Day {selectedPhoto.days_clean}
                    </Text>
                    <Text style={[styles.modalDate, { color: colors.secondaryText }]}>
                      {formatDate(selectedPhoto.created_at)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeletePhoto(selectedPhoto.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Comparison Modal */}
      <Modal
        visible={showComparison}
        transparent
        animationType="slide"
        onRequestClose={() => setShowComparison(false)}
      >
        <View style={styles.comparisonContainer}>
          <TouchableOpacity
            style={styles.comparisonBackdrop}
            activeOpacity={1}
            onPress={() => setShowComparison(false)}
          />
          <View style={[styles.comparisonContent, { backgroundColor: colors.primaryBackground }]}>
            <View style={styles.comparisonHeader}>
              <Text style={[styles.comparisonTitle, { color: colors.primaryText }]}>
                Progress Comparison
              </Text>
              <TouchableOpacity onPress={() => setShowComparison(false)}>
                <Ionicons name="close" size={28} color={colors.primaryText} />
              </TouchableOpacity>
            </View>

            <View style={styles.comparisonImages}>
              {/* First Photo */}
              <View style={styles.comparisonImageContainer}>
                <Image
                  source={{ uri: photos[photos.length - 1]?.photo_url }}
                  style={styles.comparisonImage}
                  resizeMode="cover"
                />
                <View style={styles.comparisonLabel}>
                  <Text style={styles.comparisonLabelText}>
                    Day {photos[photos.length - 1]?.days_clean}
                  </Text>
                  <Text style={styles.comparisonLabelDate}>
                    {formatDate(photos[photos.length - 1]?.created_at)}
                  </Text>
                </View>
              </View>

              {/* Arrow */}
              <View style={styles.comparisonArrow}>
                <Ionicons name="arrow-forward" size={32} color={colors.primaryAccent} />
              </View>

              {/* Latest Photo */}
              <View style={styles.comparisonImageContainer}>
                <Image
                  source={{ uri: photos[0]?.photo_url }}
                  style={styles.comparisonImage}
                  resizeMode="cover"
                />
                <View style={styles.comparisonLabel}>
                  <Text style={styles.comparisonLabelText}>
                    Day {photos[0]?.days_clean}
                  </Text>
                  <Text style={styles.comparisonLabelDate}>
                    {formatDate(photos[0]?.created_at)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.comparisonStats, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.comparisonStatsText, { color: colors.primaryAccent }]}>
                ✨ {photos[0]?.days_clean - photos[photos.length - 1]?.days_clean} days of progress!
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.headingLarge,
    fontWeight: '700',
  },
  statsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
    opacity: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: 16,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.sm,
  },
  photoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  photoDays: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  photoDate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  addButtonContainer: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
  },
  addButtonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  addButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1.4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 400,
  },
  modalInfo: {
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  comparisonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  comparisonBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  comparisonContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  comparisonTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  comparisonImages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  comparisonImageContainer: {
    flex: 1,
    maxWidth: '42%',
  },
  comparisonImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  comparisonLabel: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  comparisonLabelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  comparisonLabelDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  comparisonArrow: {
    paddingHorizontal: SPACING.sm,
  },
  comparisonStats: {
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  comparisonStatsText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default NailProgressScreen;
