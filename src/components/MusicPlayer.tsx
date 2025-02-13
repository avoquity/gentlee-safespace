
import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-sm w-full h-[440px] flex flex-col justify-between border-2 border-black">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-deep-charcoal font-poppins font-medium text-lg">
            {isPlaying ? "Breathe, listen, reflect" : "A moment for you"}
          </span>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-deep-charcoal hover:text-dusty-rose transition-colors"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
        
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-dusty-rose text-white hover:bg-opacity-90 transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <div className="flex-1">
            <div className="flex space-x-1.5">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-24 rounded-full bg-soft-yellow/30 animate-wave`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    opacity: isPlaying ? 1 : 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-base text-deep-charcoal/70 font-poppins text-center border-t border-deep-charcoal/10 pt-4 mt-auto">
        Soft Instrumental Melody
      </div>
    </div>
  );
};

export default MusicPlayer;
