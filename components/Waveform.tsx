import React from 'react';

export const Waveform: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  return (
    <div className="flex items-center justify-center space-x-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full bg-neon-400 ${isPlaying ? 'animate-wave' : 'h-1'}`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: isPlaying ? '1s' : '0s'
          }}
        />
      ))}
    </div>
  );
};