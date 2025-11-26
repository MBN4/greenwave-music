import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { Icon } from './Icons';
import { api, CURRENT_USER_ID } from '../services/mockBackend';

interface SongCardProps {
  song: Song;
  playlist: Song[];
  index: number;
  onLikeToggle?: () => void;
  onDelete?: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, playlist, index, onLikeToggle, onDelete }) => {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(song.likedByUser);
  const [isDeleted, setIsDeleted] = useState(false);
  
  const isCurrent = currentSong?.id === song.id;
  const isOwner = true; //song.uploadedBy.id === CURRENT_USER_ID

  const handleLike = async () => {
    const newStatus = !isLiked;
    setIsLiked(newStatus);
    
    if (newStatus) {
      showToast("Added to Library", "success");
    } else {
      showToast("Removed from Library", "info");
    }
    
    await api.toggleLike(song.id);
    if (onLikeToggle) {
      onLikeToggle();
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Song",
      `Are you sure you want to delete "${song.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
             setIsDeleted(true);
             try {
               await api.deleteSong(song.id);
               showToast("Song deleted", "info");
               if (onDelete) onDelete();
             } catch (e) {
               console.error("Delete failed", e);
               setIsDeleted(false);
               showToast("Failed to delete song", "info");
             }
          }
        }
      ]
    );
  };

  if (isDeleted) return null;

  return (
    <TouchableOpacity 
      onPress={() => playSong(song, playlist)}
      style={[styles.container, isCurrent && styles.activeContainer]}
      activeOpacity={0.7}
    >
      <View style={styles.coverContainer}>
        <Image source={{ uri: song.coverUrl }} style={styles.coverImage} />
        {isCurrent && (
          <View style={styles.overlay}>
             <Icon name={isPlaying ? "pause" : "play"} size={20} color="#22c55e" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.title, isCurrent && styles.activeText]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
      </View>

      <View style={styles.actionsContainer}>
        {isOwner && (
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Icon name="trash-2" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Icon name="heart" size={18} color={isLiked ? '#22c55e' : '#71717a'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  activeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  coverContainer: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#27272a',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  activeText: {
    color: '#22c55e',
  },
  artist: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  }
});