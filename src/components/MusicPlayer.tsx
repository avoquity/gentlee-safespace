
import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-sm w-full">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-deep-charcoal font-poppins font-medium">Now Playing</span>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-deep-charcoal hover:text-dusty-rose transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-dusty-rose text-white hover:bg-opacity-90 transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div className="flex-1">
            <div className="flex space-x-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-8 rounded-full bg-dusty-rose/30 animate-wave`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    opacity: isPlaying ? 1 : 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <span className="text-sm text-deep-charcoal/70 font-poppins">
          Soft Instrumental Melody
        </span>
      </div>
    </div>
  );
};

export default MusicPlayer;
