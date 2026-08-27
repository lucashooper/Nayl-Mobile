import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Book, Trophy, ChartBar, Flame } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2;

interface QuickActionsModalProps {
  visible: boolean;
  onClose: () => void;
  onJournal: () => void;
  onAchievements: () => void;
  onAnalytics: () => void;
  onStreak: () => void;
}

const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  visible,
  onClose,
  onJournal,
  onAchievements,
  onAnalytics,
  onStreak,
}) => {
  const insets = useSafeAreaInsets();

  const gridActions = [
    {
      id: 'journal',
      label: 'Journal',
      subtitle: 'Triggers & reflections',
      icon: <Book size={26} color="#FFFFFF" weight="duotone" />,
      onPress: onJournal,
      gradient: ['rgba(88, 28, 135, 0.55)', 'rgba(147, 51, 234, 0.35)'] as const,
    },
    {
      id: 'achievements',
      label: 'Achievements',
      subtitle: 'Your milestones',
      icon: <Trophy size={26} color="#FFFFFF" weight="duotone" />,
      onPress: onAchievements,
      gradient: ['rgba(30, 41, 59, 0.65)', 'rgba(15, 23, 42, 0.45)'] as const,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      subtitle: 'Progress insights',
      icon: <ChartBar size={26} color="#FFFFFF" weight="duotone" />,
      onPress: onAnalytics,
      gradient: ['rgba(76, 29, 149, 0.5)', 'rgba(109, 40, 217, 0.3)'] as const,
    },
    {
      id: 'streak',
      label: 'Streak',
      subtitle: 'View your flame streak',
      icon: <Flame size={26} color="#FFFFFF" weight="duotone" />,
      onPress: onStreak,
      gradient: ['rgba(180, 83, 9, 0.55)', 'rgba(234, 88, 12, 0.35)'] as const,
    },
  ];

  const handleAction = (action: () => void) => {
    onClose();
    setTimeout(action, 180);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView intensity={Platform.OS === 'ios' ? 55 : 40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.backdropTint} />
        </Pressable>

        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 72 }]}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Quick access</Text>
            <Text style={styles.title}>What would you like to do?</Text>
          </View>

          <View style={styles.promptCard}>
            <BlurView intensity={28} tint="dark" style={styles.promptBlur}>
              <View style={styles.promptInner}>
                <Ionicons name="sparkles-outline" size={18} color="rgba(255,255,255,0.7)" />
                <View style={styles.promptTextWrap}>
                  <Text style={styles.promptTitle}>Stay on track today</Text>
                  <Text style={styles.promptSubtitle}>Log a reflection or review your progress</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.35)" />
              </View>
            </BlurView>
          </View>

          <View style={styles.grid}>
            {gridActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.gridCard}
                onPress={() => handleAction(action.onPress)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[...action.gradient]} style={styles.gridCardGradient}>
                  <BlurView intensity={18} tint="dark" style={styles.gridCardBlur}>
                    <View style={styles.gridCardInner}>
                      {action.icon}
                      <View style={styles.gridCardText}>
                        <Text style={styles.gridLabel}>{action.label}</Text>
                        <Text style={styles.gridSubtitle}>{action.subtitle}</Text>
                      </View>
                    </View>
                  </BlurView>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.closeWrap, { bottom: Math.max(insets.bottom, 16) + 8 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.85}>
            <LinearGradient
              colors={['rgba(147, 51, 234, 0.95)', 'rgba(109, 40, 217, 0.85)']}
              style={styles.closeGradient}
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdropTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 7, 12, 0.45)',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.45)',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  promptCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  promptBlur: {
    overflow: 'hidden',
  },
  promptInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    gap: 12,
  },
  promptTextWrap: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  promptSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  gridCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.92,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gridCardGradient: {
    flex: 1,
  },
  gridCardBlur: {
    flex: 1,
  },
  gridCardInner: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gridCardText: {
    marginTop: 'auto',
  },
  gridLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  gridSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    lineHeight: 14,
  },
  closeWrap: {
    position: 'absolute',
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  closeButton: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  closeGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
});

export default QuickActionsModal;
