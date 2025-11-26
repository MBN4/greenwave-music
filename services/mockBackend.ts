import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, User } from '../types';

export const CURRENT_USER_ID = 'u1';

const MOCK_USER: User = {
  id: CURRENT_USER_ID,
  name: 'Neo User',
  email: 'neo@greenwave.fm',
  avatar: 'https://picsum.photos/200'
};

const INITIAL_SONGS: Song[] = [
  {
    id: 's1',
    title: 'Good Night',
    artist: 'FASSounds',
    url: 'https://cdn.pixabay.com/audio/2024/09/13/audio_33276632f7.mp3',
    coverUrl: 'https://picsum.photos/id/56/400/400',
    uploadedBy: { id: 'u2', name: 'Admin', email: 'admin@gw.fm', avatar: '' },
    duration: 120,
    createdAt: Date.now() - 100000,
    likes: 42,
    likedByUser: false
  },
  {
    id: 's2',
    title: 'Lofi Study',
    artist: 'FASSounds',
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    coverUrl: 'https://picsum.photos/id/68/400/400',
    uploadedBy: { id: 'u2', name: 'Admin', email: 'admin@gw.fm', avatar: '' },
    duration: 160,
    createdAt: Date.now() - 50000,
    likes: 128,
    likedByUser: true
  }
];

const STORAGE_KEY = 'greenwave_songs_v1';

export const api = {
  getCurrentUser: async (): Promise<User> => {
    return MOCK_USER;
  },

  getSongs: async (): Promise<Song[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (jsonValue != null) {
        const songs = JSON.parse(jsonValue);
        return songs.sort((a: Song, b: Song) => b.createdAt - a.createdAt);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SONGS));
        return INITIAL_SONGS;
      }
    } catch (e) {
      console.error("Failed to load songs", e);
      return INITIAL_SONGS;
    }
  },

  getLikedSongs: async (): Promise<Song[]> => {
    const allSongs = await api.getSongs();
    return allSongs.filter(song => song.likedByUser);
  },

  uploadSong: async (fileData: { uri: string; name: string }, user: User, title: string): Promise<Song> => {
    try {
      const currentSongs = await api.getSongs();

      const newSong: Song = {
        id: Date.now().toString(),
        title: title || fileData.name.replace(/\.[^/.]+$/, ""),
        artist: user.name,
        url: fileData.uri, 
        coverUrl: `https://picsum.photos/400/400?random=${Date.now()}`,
        uploadedBy: user,
        duration: 0, 
        createdAt: Date.now(),
        likes: 0,
        likedByUser: false
      };

      const updatedSongs = [newSong, ...currentSongs];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSongs));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return newSong;
    } catch (error) {
      console.error("Upload failed", error);
      throw error;
    }
  },

  deleteSong: async (id: string): Promise<void> => {
    try {
      const currentSongs = await api.getSongs();
      const updatedSongs = currentSongs.filter(s => s.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSongs));
    } catch (e) {
      console.error("Failed to delete song", e);
      throw e;
    }
  },

  toggleLike: async (songId: string): Promise<boolean> => {
    try {
      const currentSongs = await api.getSongs();
      let newStatus = false;

      const updatedSongs = currentSongs.map(song => {
        if (song.id === songId) {
          newStatus = !song.likedByUser;
          return {
            ...song,
            likedByUser: newStatus,
            likes: newStatus ? song.likes + 1 : song.likes - 1
          };
        }
        return song;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSongs));
      return newStatus;
    } catch (e) {
      console.error("Error toggling like", e);
      return false;
    }
  }
};