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
  // This Ref tracks the "ID" of the current load request to prevent race conditions
  const loadingIdRef = useRef(0);

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
        nextSong();
    }
  };

  const playSongInternal = async (song: Song) => {
    // Generate a new ID for this specific play attempt
    const myLoadId = loadingIdRef.current + 1;
    loadingIdRef.current = myLoadId;

    try {
      // 1. Safely unload the previous song
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
      } catch (e) {
        // Ignore unload errors (common on Android if already unloading)
        console.log("Unload error ignored"); 
      }

      // 2. Check if the user clicked another song while we were unloading
      if (loadingIdRef.current !== myLoadId) return;

      // 3. Update UI
      setCurrentSong(song);
      setMiniPlayerVisible(true); 

      // 4. Load the new song
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      // 5. Final check: Did the user click ANOTHER song while this one was loading?
      if (loadingIdRef.current !== myLoadId) {
         // If yes, unload this sound immediately and stop.
         await sound.unloadAsync(); 
         return;
      }

      // 6. Success!
      soundRef.current = sound;
      setIsPlaying(true);

    } catch (error) {
      // Only show error if THIS was the latest request
      if (loadingIdRef.current === myLoadId) {
        console.error("Error playing sound:", error);
        // Don't alert for small network hiccups if it plays anyway
        // Alert.alert("Playback Error", "Could not play this song."); 
        setIsPlaying(false);
      }
    }
  };

  const playSong = (song: Song, newQueue?: Song[]) => {
    if (newQueue) {
      setQueue(newQueue);
    }
    if (currentSong?.id === song.id) {
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
    // Hide UI first to feel responsive
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