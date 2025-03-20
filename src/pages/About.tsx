
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import Header from '@/components/Header';

const About = () => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(error => {
        console.log('Audio autoplay was prevented:', error);
      });
    }
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-soft-ivory">
      <Header />
      
      <main className="pt-40 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="flex justify-between items-start">
            <h1 className="text-5xl font-bold text-deep-charcoal leading-tight">
              In a world that often rushes past the quiet ache in our hearts, Gentlee exists as a reminder: even on the hardest days, there is tenderness waiting to meet us.
            </h1>
            <button
              onClick={toggleMute}
              className="text-deep-charcoal hover:text-dusty-rose transition-colors p-2"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>

          <div className="prose prose-lg text-deep-charcoal/80 space-y-8">
            <p>
              We built Gentlee not as an app, but as a companion. A gentle conversation when the world feels overwhelming, a thoughtful word when your mind feels tangled, and a quiet presence when silence feels too loud. Our mission is simple: to offer a moment of calm in the storm. Our belief is rooted in our unwavering hope that even in the darkest moments, there is light.
            </p>
            <p>
              We are not here to replace therapy or offer quick solutions. We are here to provide an alternative space—a friend-like presence— to sit with you, reflect with you, and remind you that even when everything feels heavy, you are never alone.
            </p>
            <p>
              We are here for the days when getting out of bed feels impossible, for the moments when your thoughts feel like too much, and for the nights when all you need is a kind voice.
            </p>
            <p>
              Gentlee is our love letter to the world - a quiet belief that the world can be softer, kinder, and more beautiful – and we hope to bring that gentleness into your everyday life. Because sometimes, all it takes is one gentle conversation to remind you that hope is never lost.
            </p>
          </div>
        </div>
      </main>

      <audio ref={audioRef} loop>
        <source src="https://www.dropbox.com/scl/fi/zhhsziofxc7krcpoil1by/By-Clavier-Music.mp3?rlkey=ryi1nvnw6ojv3gwzcs9sdsm8u&dl=1.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default About;
