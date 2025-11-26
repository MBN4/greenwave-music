import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { usePlayer } from '../context/PlayerContext';
import { Icon } from './Icons';
import { FullPlayer } from './FullPlayer';

export const MiniPlayer: React.FC = () => {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, progress, duration, miniPlayerVisible, closePlayer } = usePlayer();
  const [showFull, setShowFull] = useState(false);

  if (!currentSong || !miniPlayerVisible) return null;

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.playerContent}>
          
          <TouchableOpacity 
            onPress={() => setShowFull(true)}
            style={styles.infoSection}
            activeOpacity={0.7}
          >
            <View style={styles.artContainer}>
              <Image source={{ uri: currentSong.coverUrl }} style={styles.art} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
              <Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.controls}>
            <TouchableOpacity onPress={prevSong} style={styles.controlButton} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="skip-back" size={20} color="#a1a1aa" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={togglePlay} style={styles.playButton} hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
              <Icon name={isPlaying ? "pause" : "play"} size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={nextSong} style={styles.controlButton} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="skip-forward" size={20} color="#a1a1aa" />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity onPress={closePlayer} style={styles.closeButton} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="x" size={18} color="#71717a" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      </View>

      <Modal 
        visible={showFull} 
        animationType="slide" 
        presentationStyle="fullScreen"
        onRequestClose={() => setShowFull(false)}
      >
        <FullPlayer onClose={() => setShowFull(false)} />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 84, 
    left: 12,
    right: 12,
    zIndex: 50,
  },
  playerContent: {
    height: 64,
    backgroundColor: '#18181b', 
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    overflow: 'hidden',
  },
  infoSection: {
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingRight: 8,
  },
  artContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#27272a',
    overflow: 'hidden',
  },
  art: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'transparent',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
});