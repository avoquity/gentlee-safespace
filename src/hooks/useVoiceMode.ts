
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVoiceMode = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const speakText = useCallback(async (text: string) => {
    if (isPlaying && currentAudio) {
      // Stop current audio
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);

      const { data, error } = await supabase.functions.invoke('text-to-voice', {
        body: { text, voice: 'flHkNRp1BlvT73UL6gyz' }
      });

      if (error) {
        throw error;
      }

      if (data?.audioContent) {
        const audioBlob = new Blob([
          Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
        ], { type: 'audio/mpeg' });

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        setCurrentAudio(audio);

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  }, [isPlaying, currentAudio]);

  const stopSpeaking = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  }, [currentAudio]);

  return {
    isPlaying,
    speakText,
    stopSpeaking
  };
};
