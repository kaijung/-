import React from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isPlaying }) => {
  return (
    <div className="h-12 flex items-center justify-center gap-1">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 bg-amber-500 rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'h-1.5 opacity-30'}`}
          style={{
            height: isPlaying ? `${Math.max(20, Math.random() * 100)}%` : '6px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );
};