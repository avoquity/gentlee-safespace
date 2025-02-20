
import React, { createContext, useContext, useState, useEffect } from 'react';

type Track = {
  id: string;
  title: string;
  url: string;
};

const tracks: Track[] = [
  { id: '1', title: 'Gentle Rain', url: '/music/gentle-rain.mp3' },
  { id: '2', title: 'Ocean Waves', url: '/music/ocean-waves.mp3' },
  { id: '3', title: 'Forest Ambience', url: '/music/forest-ambience.mp3' }
];

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: Track;
  togglePlay: () => void;
  nextTrack: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(() => {
    const stored = localStorage.getItem('musicIsPlaying');
    return stored ? JSON.parse(stored) : true;
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audio] = useState(new Audio(tracks[0].url));

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    localStorage.setItem('musicIsPlaying', JSON.stringify(!isPlaying));
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    audio.loop = true;
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audio]);

  useEffect(() => {
    if (isPlaying) {
      audio.play().catch(error => {
        console.log('Audio playback was prevented:', error);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, audio]);

  useEffect(() => {
    audio.muted = isMuted;
  }, [isMuted, audio]);

  useEffect(() => {
    const oldAudio = audio;
    const newAudio = new Audio(tracks[currentTrackIndex].url);
    newAudio.loop = true;
    
    // Crossfade effect
    let fade = 0;
    const fadeInterval = setInterval(() => {
      fade += 0.1;
      oldAudio.volume = Math.max(0, 1 - fade);
      newAudio.volume = Math.min(1, fade);
      
      if (fade >= 1) {
        clearInterval(fadeInterval);
        oldAudio.pause();
      }
    }, 50);

    if (isPlaying) {
      newAudio.play().catch(console.error);
    }

    return () => {
      clearInterval(fadeInterval);
      oldAudio.pause();
      newAudio.pause();
    };
  }, [currentTrackIndex]);

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        currentTrack: tracks[currentTrackIndex],
        togglePlay,
        nextTrack,
        isMuted,
        toggleMute
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
