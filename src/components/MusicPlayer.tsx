
import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';

const MusicPlayer = () => {
  const { isPlaying, currentTrack, togglePlay, nextTrack, isMuted, toggleMute } = useMusic();
  const [progress, setProgress] = useState(0);
  
  // Track progress for the progress bar
  useEffect(() => {
    let intervalId: number;
    
    if (isPlaying) {
      // Update progress every second when playing
      intervalId = window.setInterval(() => {
        setProgress(prev => {
          // Reset progress when it reaches 100%
          if (prev >= 100) {
            return 0;
          }
          return prev + 0.25; // Increment by small amount for smoother animation
        });
      }, 250);
    }
    
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isPlaying]);
  
  // Reset progress when track changes
  useEffect(() => {
    setProgress(0);
  }, [currentTrack]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg w-full max-w-sm border border-black/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1" />
        <button
          onClick={toggleMute}
          className="text-deep-charcoal hover:text-dusty-rose transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
      
      <div className="relative">
        {/* Waveform visualization with reduced height (50%) */}
        <div className="flex w-full h-12 space-x-1 mb-2">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-full bg-soft-yellow/30 animate-wave transition-opacity duration-300`}
              style={{
                animationDelay: `${i * 0.1}s`,
                opacity: isPlaying ? 1 : 0.5,
                height: '100%',
              }}
            />
          ))}
        </div>
        
        {/* Centered Play/Pause button overlay */}
        <button
          onClick={togglePlay}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    w-12 h-12 flex items-center justify-center rounded-full 
                    bg-dusty-rose text-white shadow-lg hover:bg-opacity-90 
                    transition-all duration-300 ease-in-out ${isPlaying ? 'scale-95' : 'scale-100'}`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? 
            <Pause size={24} className="animate-fade-in" /> : 
            <Play size={24} className="animate-fade-in ml-1" />
          }
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-muted-sage to-dusty-rose transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default MusicPlayer;
