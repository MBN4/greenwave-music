import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Song } from '../types';
import { api } from '../services/mockBackend';
import { SongCard } from '../components/SongCard';
import { Icon } from '../components/Icons';

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all songs initially
  useEffect(() => {
    const loadData = async () => {
      const allSongs = await api.getSongs();
      setSongs(allSongs);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter logic
  useEffect(() => {
    if (!query.trim()) {
      setFilteredSongs([]);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const results = songs.filter(s => 
      s.title.toLowerCase().includes(lowerQuery) || 
      s.artist.toLowerCase().includes(lowerQuery)
    );
    setFilteredSongs(results);
  }, [query, songs]);

  // Handle re-fetching data after an action (like delete or like)
  const handleRefresh = async () => {
     const allSongs = await api.getSongs();
     setSongs(allSongs);
     // Re-trigger filter implicitly via state update
  };

  return (
    <View style={styles.container}>
       {/* Search Header */}
       <View style={styles.searchHeader}>
         <Icon name="search" size={20} color="#71717a" style={styles.searchIcon} />
         <TextInput 
            autoFocus
            placeholder="Search songs, artists..." 
            placeholderTextColor="#71717a"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
         />
       </View>

       {/* Results */}
       <ScrollView style={styles.resultsContainer} contentContainerStyle={styles.resultsContent}>
          {loading ? (
             <View style={styles.centerContainer}>
               <ActivityIndicator size="large" color="#22c55e" />
             </View>
          ) : query.trim() === '' ? (
             <View style={styles.emptyContainer}>
                <Icon name="search" size={64} color="#3f3f46" />
                <Text style={styles.emptyTitle}>Find your vibe</Text>
                <Text style={styles.emptySubtitle}>Search by title or artist</Text>
             </View>
          ) : filteredSongs.length === 0 ? (
             <View style={styles.centerContainer}>
                <Text style={styles.noResultsText}>No results found for "{query}"</Text>
             </View>
          ) : (
             <View>
                {filteredSongs.map((song, idx) => (
                   <SongCard 
                     key={song.id} 
                     song={song} 
                     playlist={filteredSongs} 
                     index={idx} 
                     onLikeToggle={handleRefresh}
                     onDelete={handleRefresh}
                   />
                ))}
             </View>
          )}
       </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 48,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b', // zinc-900
    marginHorizontal: 16,
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272a', // zinc-800
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    height: '100%',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: 16,
    paddingBottom: 150,
  },
  centerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#71717a', // zinc-500
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#52525b', // zinc-600
    marginTop: 4,
  },
  noResultsText: {
    color: '#71717a', // zinc-500
    fontSize: 16,
  }
});