import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
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

const { width } = Dimensions.get('window');

export const SongCard: React.FC<SongCardProps> = ({ song, playlist, index, onLikeToggle, onDelete }) => {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(song.likedByUser);
  const [isDeleted, setIsDeleted] = useState(false);
  
  // State for the Custom Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const isCurrent = currentSong?.id === song.id;
  const isOwner = song.uploadedBy.id === CURRENT_USER_ID;

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

  // 1. Open the custom modal instead of Alert.alert
  const handleDeleteRequest = () => {
    setShowDeleteModal(true);
  };

  // 2. The actual logic to run when user clicks "Confirm" in the modal
  const confirmDelete = async () => {
    setShowDeleteModal(false); // Close modal
    setIsDeleted(true);        // Hide card immediately (Optimistic UI)
    
    try {
      await api.deleteSong(song.id);
      showToast("Song deleted", "info");
      if (onDelete) onDelete();
    } catch (e) {
      console.error("Delete failed", e);
      setIsDeleted(false); // Revert if failed
      showToast("Failed to delete song", "info");
    }
  };

  if (isDeleted) return null;

  return (
    <>
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
            <TouchableOpacity onPress={handleDeleteRequest} style={styles.actionButton}>
              <Icon name="trash-2" size={18} color="#ef4444" />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Icon name="heart" size={18} color={isLiked ? '#22c55e' : '#71717a'} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* --- CUSTOM DELETE MODAL --- */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.warningIcon}>
                <Icon name="trash-2" size={24} color="#ef4444" />
              </View>
              <Text style={styles.modalTitle}>Delete Track?</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              Are you sure you want to delete <Text style={styles.highlightText}>"{song.title}"</Text>? 
              This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  },
  
  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker dim for focus
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#18181b', // zinc-900
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // red-500/10
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalMessage: {
    color: '#a1a1aa', // zinc-400
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  highlightText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#27272a', // zinc-800
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ef4444', // red-500
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  }
});