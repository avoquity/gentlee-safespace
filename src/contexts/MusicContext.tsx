
import React, { createContext, useContext, useState, useEffect } from 'react';

type Track = {
  id: string;
  title: string;
  url: string;
};

const tracks: Track[] = [
  { 
    id: '1', 
    title: 'By Clavier Music', 
    url: 'https://www.dropbox.com/scl/fi/zhhsziofxc7krcpoil1by/By-Clavier-Music.mp3?rlkey=ryi1nvnw6ojv3gwzcs9sdsm8u&dl=1'
  },
  { 
    id: '2', 
    title: 'Calm Piano', 
    url: 'https://www.dropbox.com/scl/fi/vcgmw1mi4ce1jpv2xggxh/Calm-Piano-By-Clavier-Music.mp3?rlkey=3kkkgg22utcmkdeop4pz4x2je&dl=1'
  },
  { 
    id: '3', 
    title: 'Prelude', 
    url: 'https://www.dropbox.com/scl/fi/yja7ywsp667o7h0w5sk8n/Prelude-By-Sigma-Music-Art.mp3?rlkey=vf4xrg1g4hzyg976lnfejjhl3&dl=1'
  },
  { 
    id: '4', 
    title: 'Reverie', 
    url: 'https://www.dropbox.com/scl/fi/ssbgl0j8u95r6n1ijshmx/Reverie-By-Clavier-Music.mp3?rlkey=eakliyc9tut9ks51br5w5v69n&dl=1'
  },
  { 
    id: '5', 
    title: 'Uplifting Piano', 
    url: 'https://www.dropbox.com/scl/fi/pt16sp977dzgikn7a6sgl/Uplifting-Piano-By-Clavier-Music.mp3?rlkey=97qwr1vl30azr78shhpc101k0&dl=1'
  }
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
  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem('musicIsMuted');
    return stored ? JSON.parse(stored) : false;
  });
  const [audio] = useState(new Audio(tracks[0].url));

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    localStorage.setItem('musicIsPlaying', JSON.stringify(!isPlaying));
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('musicIsMuted', JSON.stringify(newMutedState));
  };

  useEffect(() => {
    audio.loop = false; // Disable loop to allow auto-next track
    audio.addEventListener('ended', nextTrack);
    
    return () => {
      audio.removeEventListener('ended', nextTrack);
      audio.pause();
      audio.src = '';
    };
  }, [audio]);

  useEffect(() => {
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Audio playback was prevented:', error);
        });
      }
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
    newAudio.loop = false; // Disable loop to allow auto-next track
    newAudio.muted = isMuted; // Apply current mute state
    
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

    // Set up ended event for auto-next
    newAudio.addEventListener('ended', nextTrack);

    return () => {
      clearInterval(fadeInterval);
      oldAudio.pause();
      newAudio.pause();
      newAudio.removeEventListener('ended', nextTrack);
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
