import React from 'react';
import { 
  Home, Search, PlusCircle, Library, User, Plus, Construction,
  Play, Pause, Heart, Trash2, CheckCircle, Info, Music, Zap, Upload,
  SkipBack, SkipForward, X, ChevronDown, MoreHorizontal, Shuffle, Repeat,
  RotateCcw, RotateCw // <--- ADD THESE
} from 'lucide-react-native';
import { StyleProp, ViewStyle } from 'react-native';
import { LucideProps } from 'lucide-react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  className?: string; 
  fill?: boolean;
}

const iconMap: Record<string, React.FC<LucideProps>> = {
  'home': Home,
  'search': Search,
  'plus-circle': PlusCircle,
  'library': Library,
  'user': User,
  'plus': Plus,
  'construction': Construction,
  'play': Play,
  'pause': Pause,
  'heart': Heart,
  'trash-2': Trash2,
  'check-circle': CheckCircle,
  'info': Info,
  'music': Music,
  'zap': Zap,
  'upload': Upload,
  'skip-back': SkipBack,
  'skip-forward': SkipForward,
  'x': X,
  'chevron-down': ChevronDown,
  'more-horizontal': MoreHorizontal,
  'shuffle': Shuffle,
  'repeat': Repeat,
  'rotate-ccw': RotateCcw, // Back 5s
  'rotate-cw': RotateCw,   // Forward 5s
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = 'white', style }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} style={style} />;
};