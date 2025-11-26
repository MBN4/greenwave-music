import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Song } from '../types';
import { api } from '../services/mockBackend';
import { usePlayer } from '../context/PlayerContext';
import { SongCard } from '../components/SongCard';
import { Icon } from '../components/Icons';

export const LibraryScreen: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();

  const fetchLikedSongs = async () => {
    try {
      const data = await api.getLikedSongs();
      setSongs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    
    // Create a copy and shuffle
    const shuffled = [...songs].sort(() => 0.5 - Math.random());
    playSong(shuffled[0], shuffled);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Icon name="heart" size={24} color="#22c55e" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Your Library</Text>
            <Text style={styles.headerSubtitle}>{songs.length} liked tracks</Text>
          </View>
        </View>

        {/* Shuffle Button */}
        {songs.length > 0 && (
          <TouchableOpacity 
            onPress={handleShufflePlay}
            style={styles.shuffleButton}
          >
            <Icon name="shuffle" size={24} color="#22c55e" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : songs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="music" size={48} color="#52525b" />
          <Text style={styles.emptyTitle}>No Liked Songs Yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any track to add it to your collection.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {songs.map((song, index) => (
            <SongCard 
              key={song.id} 
              song={song} 
              playlist={songs} 
              index={index}
              onLikeToggle={fetchLikedSongs} // Refresh list if unliked
              onDelete={fetchLikedSongs} // Refresh list if deleted
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  contentContainer: {
    paddingBottom: 150,
    paddingHorizontal: 16,
    paddingTop: 48,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 197, 94, 0.1)', // neon-500/10
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(34, 197, 94, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    color: '#a1a1aa', // zinc-400
    fontSize: 14,
    marginTop: 4,
  },
  shuffleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27272a', // zinc-800
    borderWidth: 1,
    borderColor: '#3f3f46', // zinc-700
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a1a1aa', // zinc-400
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#71717a', // zinc-500
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 250,
  },
  listContainer: {
    flexDirection: 'column',
  }
});