import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import { body, buttonText } from '../constants/typography';
import sessionService from '../services/sessionService';
import hapticService, { HapticType, HapticIntensity } from '../services/hapticService';
import { useStreak } from '../context/StreakContext';
import Calendar from '../components/Calendar';

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

interface EditStreakScreenProps {
  navigation: any;
  route?: {
    params?: {
      onStreakUpdated?: () => void;
    };
  };
}

const EditStreakScreen: React.FC<EditStreakScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Initialize with a date 1 year ago to ensure we start well in the past
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 1);
    return defaultDate;
  });
  
  // Use streak context
  const { elapsedSeconds: currentStreak, updateStreakStartTime, isLoading } = useStreak();

  useEffect(() => {
    loadCurrentStartDate();
  }, []);

  const loadCurrentStartDate = async () => {
    try {
      const session = await sessionService.getCurrentSession();
      console.log('Session loaded:', session);
      
      if (session && session.start_time) {
        // Use the session start time, but ensure it's not in the future
        const sessionDate = new Date(session.start_time);
        const now = new Date();
        console.log('Session date:', sessionDate.toISOString());
        console.log('Current date:', now.toISOString());
        
        if (sessionDate > now) {
          // If session date is in the future, use 1 year ago instead
          const defaultDate = new Date();
          defaultDate.setFullYear(defaultDate.getFullYear() - 1);
          console.log('Using fallback date (1 year ago):', defaultDate.toISOString());
          setSelectedDate(defaultDate);
        } else {
          console.log('Using session date:', sessionDate.toISOString());
          setSelectedDate(sessionDate);
        }
      } else {
        // If no session exists, default to 1 year ago to ensure we're well in the past
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 1);
        console.log('No session, using default date (1 year ago):', defaultDate.toISOString());
        setSelectedDate(defaultDate);
      }
    } catch (error) {
      console.error('Error loading current start date:', error);
      // Fallback to 1 year ago
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() - 1);
      console.log('Error fallback date (1 year ago):', defaultDate.toISOString());
      setSelectedDate(defaultDate);
    }
  };

  const showDatePicker = async () => {
    console.log('Opening date picker...');
    console.log('Selected date:', selectedDate.toISOString());
    console.log('Current date:', new Date().toISOString());
    
    if (Platform.OS === 'web') {
      // For web, use native HTML date input
      const input = document.createElement('input');
      input.type = 'date';
      input.max = new Date().toISOString().split('T')[0];
      input.min = '2020-01-01';
      input.value = selectedDate.toISOString().split('T')[0];
      
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          const newDate = new Date(target.value);
          setSelectedDate(newDate);
          handleConfirmDate(newDate);
        }
      };
      
      input.click();
      return;
    }
    
    try {
      await hapticService.triggerPattern({
        type: HapticType.LIGHT_TAP,
        intensity: HapticIntensity.NORMAL,
      });
      setIsDatePickerVisible(true);
    } catch (error) {
      console.error('Haptic feedback error:', error);
      setIsDatePickerVisible(true);
    }
  };

  const hideDatePicker = () => {
    setIsDatePickerVisible(false);
  };

  const handleConfirmDate = async (date?: Date) => {
    const dateToUpdate = date || selectedDate;
    console.log('Confirming date:', dateToUpdate.toISOString());
    hideDatePicker();
    
    try {
      console.log('Updating streak start time to:', dateToUpdate.toISOString());
      await updateStreakStartTime(dateToUpdate);
      console.log('Streak start time updated successfully');
      
      // Success haptic feedback
      await hapticService.triggerPattern({
        type: HapticType.SUCCESS,
        intensity: HapticIntensity.NORMAL,
      });
      
      Alert.alert(
        'Streak Updated',
        'Your streak start date has been updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating streak:', error);
      
      // Error haptic feedback
      await hapticService.triggerPattern({
        type: HapticType.ERROR,
        intensity: HapticIntensity.NORMAL,
      });
      
      Alert.alert(
        'Error', 
        'Failed to update streak. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatTime = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) {
      return `${days}day${days > 1 ? 's' : ''} ${hours}hr ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}hr ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={COLORS.backgroundGradient}
        style={styles.backgroundContainer}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Edit Streak Date</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleConfirmDate()}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Current Streak Display */}
          <View style={styles.currentStreakContainer}>
            <Text style={styles.currentStreakLabel}>Current Streak</Text>
            <Text style={styles.currentStreakTime}>{formatTime(currentStreak)}</Text>
          </View>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              maxDate={new Date()}
              minDate={new Date(2020, 0, 1)}
              rangeStartDate={selectedDate}
              rangeEndDate={new Date()}
            />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Select a new start date for your streak. This will recalculate your elapsed time from the selected date.
            </Text>
          </View>
        </View>

        {/* Calendar Modal */}
        <Modal
          visible={isDatePickerVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={hideDatePicker}
        >
          <SafeAreaView style={styles.modalContainer}>
            <LinearGradient
              colors={COLORS.backgroundGradient}
              style={styles.modalBackground}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={hideDatePicker}
                >
                  <Ionicons name="close" size={24} color={COLORS.primaryText} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={() => handleConfirmDate()}
                >
                  <Text style={styles.modalConfirmText}>Done</Text>
                </TouchableOpacity>
              </View>

              {/* Calendar */}
              <View style={styles.modalCalendarContainer}>
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  maxDate={new Date()}
                  minDate={new Date(2020, 0, 1)}
                  rangeStartDate={selectedDate}
                  rangeEndDate={new Date()}
                />
              </View>
            </LinearGradient>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213E',
  },
  backgroundContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.headingLarge,
    color: COLORS.primaryText,
    fontWeight: '700',
    letterSpacing: 0.5, // Improved letter spacing
    // Premium layered shadows - base shadow + accent shadow
    textShadowColor: COLORS.primaryBackground,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    // Additional premium accent shadow
    shadowColor: COLORS.primaryAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  saveButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'transparent',
  },
  saveButtonText: {
    ...buttonText,
    color: '#007AFF', // iOS blue color like in the image
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  currentStreakContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  currentStreakLabel: {
    ...body,
    color: COLORS.secondaryText,
    marginBottom: SPACING.sm,
  },
  currentStreakTime: {
    ...TYPOGRAPHY.displayMedium,
    color: COLORS.primaryText,
    fontWeight: '900',
    fontSize: 32,
  },
  calendarContainer: {
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionsContainer: {
    marginBottom: SPACING.xxl,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionsText: {
    ...body,
    color: COLORS.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...TYPOGRAPHY.headingMedium,
    color: COLORS.primaryText,
    fontWeight: '700',
    letterSpacing: 0.3, // Improved letter spacing
    // Premium layered shadows - base shadow + accent shadow
    textShadowColor: COLORS.primaryBackground,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    // Additional premium accent shadow
    shadowColor: COLORS.primaryAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 0.5,
  },
  modalConfirmButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primaryAccent,
    borderRadius: SPACING.sm,
  },
  modalConfirmText: {
    ...buttonText,
    color: COLORS.primaryText,
    fontWeight: '700',
  },
  modalCalendarContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
});

export default EditStreakScreen;
