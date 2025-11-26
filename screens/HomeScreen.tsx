import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Song } from '../types';
import { api } from '../services/mockBackend';
import { SongCard } from '../components/SongCard';
import { Icon } from '../components/Icons';
import { usePlayer } from '../context/PlayerContext';

export const HomeScreen: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();

  const fetchSongs = async () => {
    try {
      const data = await api.getSongs();
      setSongs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
    const interval = setInterval(fetchSongs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayRandom = () => {
    if (songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      playSong(songs[randomIndex], songs);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>GreenWave</Text>
          <Text style={styles.headerSubtitle}>Discover community vibes</Text>
        </View>
      </View>

      <View style={styles.featuredCard}>
        <View style={styles.featuredContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>TRENDING</Text>
          </View>
          <Text style={styles.featuredTitle}>Weekly Top Hits Playlist</Text>
          <TouchableOpacity 
            onPress={handlePlayRandom}
            style={styles.playButton}
            activeOpacity={0.8}
          >
            <Icon name="play" size={14} color="black" />
            <Text style={styles.playButtonText}>Play Now</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.decorativeCircle} />
      </View>

      <View style={styles.sectionHeader}>
        <Icon name="zap" size={18} color="#22c55e" />
        <Text style={styles.sectionTitle}>Fresh Drops</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <View style={styles.listContainer}>
          {songs.map((song, index) => (
            <SongCard 
              key={song.id} 
              song={song} 
              playlist={songs} 
              index={index} 
              onDelete={fetchSongs} 
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(34, 197, 94, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 4,
  },
  featuredCard: {
    width: '100%',
    height: 192,
    borderRadius: 16,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    padding: 24,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  featuredContent: {
    position: 'relative',
    zIndex: 10,
  },
  badge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: 'black',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    maxWidth: '70%',
    marginBottom: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  playButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  decorativeCircle: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#22c55e',
    opacity: 0.4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  listContainer: {
    flexDirection: 'column',
  }
});