import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import sessionService, { USER_SESSION_CHANGED } from '../services/sessionService';

import { DeviceEventEmitter } from 'react-native';



const ACHIEVEMENTS_STORAGE_BASE = 'achievements';

const CELEBRATED_STORAGE_BASE = 'achievements_celebrated';



export interface Achievement {

  id: string;

  title: string;

  description: string;

  icon: string;

  iconSource?: any;

  gradientColors: [string, string, string];

  progress: number;

  maxProgress: number;

  isUnlocked: boolean;

  unlockedAt?: Date;

  category: 'streak' | 'milestone' | 'special' | 'daily';

  rarity: 'common' | 'rare' | 'epic' | 'legendary';

}



interface AchievementContextType {

  achievements: Achievement[];

  unlockedAchievements: Achievement[];

  achievementsLoaded: boolean;

  showAchievementOverlay: (achievementId: string) => void;

  currentOverlay: Achievement | null;

  isOverlayVisible: boolean;

  hideAchievementOverlay: () => void;

  checkAndUnlockAchievements: (progressData: any) => void;

  getAchievementProgress: (achievementId: string) => number;

}



const AchievementContext = createContext<AchievementContextType | undefined>(undefined);



const DEFAULT_ACHIEVEMENTS: Achievement[] = [

  {

    id: 'sprout',

    title: 'Sprout',

    description: 'First day without biting',

    icon: '🌱',

    iconSource: require('../../assets/bigger-achievement-icons/Sprout-280px.png'),

    gradientColors: ['#10B981', '#059669', '#047857'],

    progress: 0,

    maxProgress: 1,

    isUnlocked: false,

    category: 'streak',

    rarity: 'common',

  },

  {

    id: 'sun-kissed',

    title: 'Sun-kissed',

    description: 'A week of progress',

    icon: '☀️',

    iconSource: require('../../assets/bigger-achievement-icons/Sun-280px.png'),

    gradientColors: ['#F59E0B', '#D97706', '#B45309'],

    progress: 0,

    maxProgress: 7,

    isUnlocked: false,

    category: 'streak',

    rarity: 'rare',

  },

  {

    id: 'deeply-rooted',

    title: 'Deeply Rooted',

    description: 'One month milestone',

    icon: '🌳',

    iconSource: require('../../assets/bigger-achievement-icons/Deeply-Rooted-280px.png'),

    gradientColors: ['#8B5CF6', '#7C3AED', '#6D28D9'],

    progress: 0,

    maxProgress: 30,

    isUnlocked: false,

    category: 'streak',

    rarity: 'epic',

  },

  {

    id: 'blossoming',

    title: 'Blossoming',

    description: 'Two months of strength',

    icon: '🌸',

    iconSource: require('../../assets/bigger-achievement-icons/Blossom-280px.png'),

    gradientColors: ['#EC4899', '#DB2777', '#BE185D'],

    progress: 0,

    maxProgress: 60,

    isUnlocked: false,

    category: 'milestone',

    rarity: 'legendary',

  },

  {

    id: 'the-oak',

    title: 'The Oak',

    description: 'Three months of mastery',

    icon: '🌲',

    iconSource: require('../../assets/bigger-achievement-icons/Da-Oak-280px.png'),

    gradientColors: ['#8B5CF8', '#4B0082', '#2E0854'],

    progress: 0,

    maxProgress: 90,

    isUnlocked: false,

    category: 'milestone',

    rarity: 'legendary',

  },

  {

    id: 'conqueror',

    title: 'Conqueror',

    description: 'Six months of transformation',

    icon: '🏔️',

    iconSource: require('../../assets/bigger-achievement-icons/Landmark-280px.png'),

    gradientColors: ['#FFD700', '#FFA500', '#FF4500'],

    progress: 0,

    maxProgress: 180,

    isUnlocked: false,

    category: 'milestone',

    rarity: 'legendary',

  },

];



export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);

  const [currentOverlay, setCurrentOverlay] = useState<Achievement | null>(null);

  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const [achievementsLoaded, setAchievementsLoaded] = useState(false);



  const celebratedIdsRef = useRef<Set<string>>(new Set());

  const celebrationQueueRef = useRef<string[]>([]);

  const isProcessingCelebrationRef = useRef(false);

  const achievementsRef = useRef<Achievement[]>(DEFAULT_ACHIEVEMENTS);

  const currentOverlayIdRef = useRef<string | null>(null);



  useEffect(() => {

    achievementsRef.current = achievements;

  }, [achievements]);



  useEffect(() => {

    currentOverlayIdRef.current = currentOverlay?.id ?? null;

  }, [currentOverlay]);



  const loadCelebratedIds = async (): Promise<Set<string>> => {

    try {

      const key = await sessionService.getUserStorageKey(CELEBRATED_STORAGE_BASE);

      const stored = await AsyncStorage.getItem(key);

      if (stored) {

        return new Set(JSON.parse(stored) as string[]);

      }

    } catch {

      // Non-critical

    }

    return new Set();

  };



  const saveCelebratedIds = async (ids: Set<string>) => {

    try {

      const key = await sessionService.getUserStorageKey(CELEBRATED_STORAGE_BASE);

      await AsyncStorage.setItem(key, JSON.stringify([...ids]));

    } catch {

      // Non-critical

    }

  };



  const markCelebrated = useCallback(async (achievementId: string) => {

    celebratedIdsRef.current.add(achievementId);

    await saveCelebratedIds(celebratedIdsRef.current);

  }, []);



  const processCelebrationQueue = useCallback(() => {

    if (isProcessingCelebrationRef.current) return;



    const nextId = celebrationQueueRef.current.shift();

    if (!nextId) return;



    const achievement = achievementsRef.current.find((a) => a.id === nextId);

    if (!achievement) {

      processCelebrationQueue();

      return;

    }



    isProcessingCelebrationRef.current = true;

    setCurrentOverlay(achievement);

    setIsOverlayVisible(true);

  }, []);



  const enqueueCelebration = useCallback(

    (achievementId: string) => {

      if (celebratedIdsRef.current.has(achievementId)) return;

      if (celebrationQueueRef.current.includes(achievementId)) return;



      celebrationQueueRef.current.push(achievementId);

      processCelebrationQueue();

    },

    [processCelebrationQueue],

  );



  useEffect(() => {

    loadAchievements();



    const subscription = DeviceEventEmitter.addListener(USER_SESSION_CHANGED, () => {

      setAchievementsLoaded(false);

      loadAchievements();

    });



    return () => subscription.remove();

  }, []);



  const loadAchievements = async () => {

    try {

      const hasUser = await sessionService.hasUser();

      if (!hasUser) {

        celebratedIdsRef.current = new Set();

        celebrationQueueRef.current = [];

        setAchievements(DEFAULT_ACHIEVEMENTS);

        setAchievementsLoaded(true);

        return;

      }



      const key = await sessionService.getUserStorageKey(ACHIEVEMENTS_STORAGE_BASE);

      const stored = await AsyncStorage.getItem(key);



      let mergedAchievements = DEFAULT_ACHIEVEMENTS;

      if (stored) {

        const loadedAchievements = JSON.parse(stored);

        mergedAchievements = DEFAULT_ACHIEVEMENTS.map((defaultAchievement) => {

          const storedAchievement = loadedAchievements.find(

            (a: Achievement) => a.id === defaultAchievement.id,

          );

          if (!storedAchievement) return defaultAchievement;

          return {

            ...defaultAchievement,

            ...storedAchievement,

            progress: Math.max(storedAchievement.progress ?? 0, defaultAchievement.progress),

            isUnlocked: Boolean(storedAchievement.isUnlocked),

          };

        });

      }



      const celebrated = await loadCelebratedIds();

      mergedAchievements.forEach((achievement) => {

        if (achievement.isUnlocked) {

          celebrated.add(achievement.id);

        }

      });

      celebratedIdsRef.current = celebrated;

      await saveCelebratedIds(celebrated);



      celebrationQueueRef.current = [];

      isProcessingCelebrationRef.current = false;

      setIsOverlayVisible(false);

      setCurrentOverlay(null);

      setAchievements(mergedAchievements);

    } catch (error) {

      console.error('Failed to load achievements:', error);

      setAchievements(DEFAULT_ACHIEVEMENTS);

    } finally {

      setAchievementsLoaded(true);

    }

  };



  const saveAchievements = async (newAchievements: Achievement[]) => {

    try {

      const key = await sessionService.getUserStorageKey(ACHIEVEMENTS_STORAGE_BASE);

      await AsyncStorage.setItem(key, JSON.stringify(newAchievements));

    } catch (error) {

      console.error('Failed to save achievements:', error);

    }

  };



  const showAchievementOverlay = useCallback((achievementId: string) => {

    enqueueCelebration(achievementId);

  }, [enqueueCelebration]);



  const hideAchievementOverlay = useCallback(() => {

    const dismissedId = currentOverlayIdRef.current;

    setIsOverlayVisible(false);

    setCurrentOverlay(null);

    currentOverlayIdRef.current = null;

    isProcessingCelebrationRef.current = false;



    if (dismissedId) {

      markCelebrated(dismissedId).finally(() => {

        setTimeout(() => processCelebrationQueue(), 350);

      });

    }

  }, [markCelebrated, processCelebrationQueue]);



  const checkAndUnlockAchievements = useCallback(

    (progressData: any) => {

      if (!achievementsLoaded) return;



      const currentStreak = progressData.currentStreak ?? 0;

      const brainRewiringProgress = progressData.brainRewiringProgress ?? currentStreak;



      setAchievements((prevAchievements) => {

        const newlyUnlocked: string[] = [];



        const updatedAchievements = prevAchievements.map((achievement) => {

          let newProgress = achievement.progress;

          let shouldUnlock = false;



          switch (achievement.id) {

            case 'sprout':

              newProgress = Math.max(achievement.progress, Math.min(currentStreak, 1));

              shouldUnlock = currentStreak >= 1 && !achievement.isUnlocked;

              break;

            case 'sun-kissed':

              newProgress = Math.max(achievement.progress, Math.min(currentStreak, 7));

              shouldUnlock = currentStreak >= 7 && !achievement.isUnlocked;

              break;

            case 'deeply-rooted':

              newProgress = Math.max(achievement.progress, Math.min(currentStreak, 30));

              shouldUnlock = currentStreak >= 30 && !achievement.isUnlocked;

              break;

            case 'blossoming':

              newProgress = Math.max(achievement.progress, Math.min(brainRewiringProgress, 60));

              shouldUnlock = brainRewiringProgress >= 60 && !achievement.isUnlocked;

              break;

            case 'the-oak':

              newProgress = Math.max(achievement.progress, Math.min(brainRewiringProgress, 90));

              shouldUnlock = brainRewiringProgress >= 90 && !achievement.isUnlocked;

              break;

            case 'conqueror':

              newProgress = Math.max(achievement.progress, Math.min(brainRewiringProgress, 180));

              shouldUnlock = brainRewiringProgress >= 180 && !achievement.isUnlocked;

              break;

          }



          if (shouldUnlock) {

            newlyUnlocked.push(achievement.id);

          }



          return {

            ...achievement,

            progress: newProgress,

            isUnlocked: shouldUnlock || achievement.isUnlocked,

            unlockedAt: shouldUnlock ? new Date() : achievement.unlockedAt,

          };

        });



        if (newlyUnlocked.length > 0) {

          saveAchievements(updatedAchievements);

          newlyUnlocked.forEach((id) => enqueueCelebration(id));

        }



        return updatedAchievements;

      });

    },

    [achievementsLoaded, enqueueCelebration],

  );



  const getAchievementProgress = useCallback(

    (achievementId: string) => {

      const achievement = achievements.find((a) => a.id === achievementId);

      return achievement ? achievement.progress : 0;

    },

    [achievements],

  );



  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);



  return (

    <AchievementContext.Provider

      value={{

        achievements,

        unlockedAchievements,

        achievementsLoaded,

        showAchievementOverlay,

        currentOverlay,

        isOverlayVisible,

        hideAchievementOverlay,

        checkAndUnlockAchievements,

        getAchievementProgress,

      }}

    >

      {children}

    </AchievementContext.Provider>

  );

};



export const useAchievements = () => {

  const context = useContext(AchievementContext);

  if (context === undefined) {

    throw new Error('useAchievements must be used within an AchievementProvider');

  }

  return context;

};

