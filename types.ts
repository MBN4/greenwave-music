export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string; // Blob URL or Base64 for demo
  coverUrl: string;
  uploadedBy: User;
  duration: number;
  createdAt: number;
  likes: number;
  likedByUser: boolean;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  history: Song[];
  progress: number; // in seconds
  duration: number; // in seconds
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;
}

export enum Tab {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  UPLOAD = 'UPLOAD',
  LIBRARY = 'LIBRARY',
  PROFILE = 'PROFILE'
}