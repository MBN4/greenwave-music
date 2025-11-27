import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Alert } from 'react-native';
import { Song, PlayerState } from '../types';

interface PlayerContextType extends PlayerState {
  playSong: (song: Song, playlist?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seek: (time: number) => void;
  addToQueue: (song: Song) => void;
  setMiniPlayerVisible: (visible: boolean) => void;
  miniPlayerVisible: boolean;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [miniPlayerVisible, setMiniPlayerVisible] = useState(false);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadingIdRef = useRef(0);
  const currentSongRef = useRef<Song | null>(null);
  const queueRef = useRef<Song[]>([]);

  // Keep refs in sync with state
  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setProgress(status.positionMillis / 1000);
    setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish && !status.isLooping) {
      // Use refs to get current values, avoiding stale closure
      const song = currentSongRef.current;
      const currentQueue = queueRef.current;
      
      if (song && currentQueue.length > 0) {
        const currentIndex = currentQueue.findIndex(s => s.id === song.id);
        const nextIndex = (currentIndex + 1) % currentQueue.length;
        playSongInternal(currentQueue[nextIndex]);
      }
    }
  };

  const playSongInternal = async (song: Song) => {
    const myLoadId = loadingIdRef.current + 1;
    loadingIdRef.current = myLoadId;

    try {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
      } catch (e) {
        console.log("Unload error ignored"); 
      }

      if (loadingIdRef.current !== myLoadId) return;

      setCurrentSong(song);
      setMiniPlayerVisible(true); 

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      if (loadingIdRef.current !== myLoadId) {
         await sound.unloadAsync(); 
         return;
      }

      soundRef.current = sound;
      setIsPlaying(true);

    } catch (error) {
      if (loadingIdRef.current === myLoadId) {
        console.error("Error playing sound:", error);
        setIsPlaying(false);
      }
    }
  };

  const playSong = (song: Song, newQueue?: Song[]) => {
    if (newQueue) {
      setQueue(newQueue);
    }
    
    // FIX: Only toggle if same song AND player is visible.
    // If player is closed, fall through to playSongInternal to reload/re-open it.
    if (currentSong?.id === song.id && miniPlayerVisible) {
      togglePlay();
      return;
    }
    
    playSongInternal(song);
  };

  const togglePlay = async () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const seek = async (time: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(time * 1000);
    }
  };

  const nextSong = () => {
    if (!currentSong || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    playSongInternal(queue[nextIndex]);
  };

  const prevSong = () => {
    if (!currentSong || queue.length === 0) return;
    
    if (progress > 3) {
        seek(0);
        return;
    }
    
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    playSongInternal(queue[prevIndex]);
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const closePlayer = async () => {
    setMiniPlayerVisible(false);
    setIsPlaying(false);
    
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
    } catch (e) {
       // Ignore stop errors
    }
  };

  return (
    <PlayerContext.Provider value={{
      currentSong,
      isPlaying,
      queue,
      history: [],
      progress,
      duration,
      volume: 1,
      isShuffle: false,
      isRepeat: false,
      playSong,
      togglePlay,
      nextSong,
      prevSong,
      seek,
      addToQueue,
      miniPlayerVisible,
      setMiniPlayerVisible,
      closePlayer
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
};