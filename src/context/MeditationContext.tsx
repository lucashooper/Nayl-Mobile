import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useVideoPlayer, VideoPlayer } from 'expo-video';

const MEDITATION_VIDEO = require('../../assets/meditation-nayl-video.mp4');

interface MeditationContextType {
  isMeditationActive: boolean;
  setIsMeditationActive: (active: boolean) => void;
  meditationPlayer: VideoPlayer;
  isMeditationVideoReady: boolean;
  meditationVideoFailed: boolean;
}

const MeditationContext = createContext<MeditationContextType | undefined>(undefined);

export const useMeditation = () => {
  const context = useContext(MeditationContext);
  if (context === undefined) {
    throw new Error('useMeditation must be used within a MeditationProvider');
  }
  return context;
};

interface MeditationProviderProps {
  children: ReactNode;
}

export const MeditationProvider: React.FC<MeditationProviderProps> = ({ children }) => {
  const [isMeditationActive, setIsMeditationActive] = useState(false);
  const [isMeditationVideoReady, setIsMeditationVideoReady] = useState(false);
  const [meditationVideoFailed, setMeditationVideoFailed] = useState(false);

  const meditationPlayer = useVideoPlayer(MEDITATION_VIDEO, (player) => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    const subscription = meditationPlayer.addListener('statusChange', ({ status, error }) => {
      if (status === 'readyToPlay') {
        setIsMeditationVideoReady(true);
      }
      if (status === 'error') {
        console.warn('Meditation video preload error:', error);
        setMeditationVideoFailed(true);
      }
    });

    return () => subscription.remove();
  }, [meditationPlayer]);

  return (
    <MeditationContext.Provider
      value={{
        isMeditationActive,
        setIsMeditationActive,
        meditationPlayer,
        isMeditationVideoReady,
        meditationVideoFailed,
      }}
    >
      {children}
    </MeditationContext.Provider>
  );
};
