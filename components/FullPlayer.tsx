import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from './Icons';
import { api } from '../services/mockBackend';

const { width } = Dimensions.get('window');

export const FullPlayer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, progress, duration, seek } = usePlayer();
  const [isLiked, setIsLiked] = useState(currentSong?.likedByUser || false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  useEffect(() => {
    setIsLiked(currentSong?.likedByUser || false);
  }, [currentSong]);

  const handleLike = async () => {
    if (currentSong) {
      const newState = await api.toggleLike(currentSong.id);
      setIsLiked(newState);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipForward = () => {
    seek(progress + 5);
  };

  const skipBackward = () => {
    seek(progress - 5);
  };

  if (!currentSong) return null;

  // REMOVED THE <MODAL> WRAPPER HERE
  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Image source={{ uri: currentSong.coverUrl }} style={styles.backgroundImage} blurRadius={50} />
        <View style={styles.backgroundOverlay} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Icon name="chevron-down" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>NOW PLAYING</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="more-horizontal" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.artContainer}>
          <View style={[styles.artWrapper, isPlaying ? styles.artWrapperPlaying : styles.artWrapperPaused]}>
            <Image source={{ uri: currentSong.coverUrl }} style={styles.art} />
          </View>
        </View>

        <View style={styles.controlsSection}>
          <View style={styles.trackInfo}>
            <View style={styles.textInfo}>
              <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
              <Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text>
            </View>
            <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
              <Icon name="heart" size={28} color={isLiked ? "#22c55e" : "white"} />
            </TouchableOpacity>
          </View>

          <View style={styles.scrubberContainer}>
            <Slider
              style={{width: '100%', height: 40}}
              minimumValue={0}
              maximumValue={duration}
              value={isDragging ? dragValue : progress}
              minimumTrackTintColor="#22c55e"
              maximumTrackTintColor="#52525b"
              thumbTintColor="#22c55e"
              onSlidingStart={() => setIsDragging(true)}
              onValueChange={(val) => setDragValue(val)}
              onSlidingComplete={(val) => {
                seek(val);
                setIsDragging(false);
              }}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(isDragging ? dragValue : progress)}
              </Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={skipBackward} style={styles.secondaryControl}>
              <Icon name="rotate-ccw" size={24} color="white" />
              <Text style={styles.skipText}>-5</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={prevSong} style={styles.mainControl}>
              <Icon name="skip-back" size={32} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={togglePlay} style={styles.playButton} activeOpacity={0.8}>
              <Icon name={isPlaying ? "pause" : "play"} size={36} color="black" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={nextSong} style={styles.mainControl}>
              <Icon name="skip-forward" size={32} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={skipForward} style={styles.secondaryControl}>
              <Icon name="rotate-cw" size={24} color="white" />
              <Text style={styles.skipText}>+5</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.8)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 20,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  artContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  artWrapper: {
    width: width - 64,
    height: width - 64,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#27272a',
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  artWrapperPlaying: {
    transform: [{ scale: 1 }],
  },
  artWrapperPaused: {
    transform: [{ scale: 0.9 }],
  },
  art: {
    width: '100%',
    height: '100%',
  },
  controlsSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  textInfo: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    color: '#a1a1aa',
    fontSize: 18,
  },
  likeButton: {
    padding: 12,
  },
  scrubberContainer: {
    marginBottom: 32,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8, 
    paddingHorizontal: 4,
  },
  timeText: {
    color: '#71717a',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryControl: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
    fontWeight: 'bold'
  },
  mainControl: {
    padding: 12,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  }
});