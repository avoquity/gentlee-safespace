
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVoiceMode = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Starting voice recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(average / 255);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      updateAudioLevel();
      
      console.log('🎤 Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [isRecording, toast]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !streamRef.current) return;

    console.log('🎤 Stopping recording and processing...');
    setIsProcessing(true);
    
    return new Promise((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = async () => {
          try {
            // Stop all tracks
            streamRef.current?.getTracks().forEach(track => track.stop());
            
            // Close audio context
            if (audioContextRef.current) {
              await audioContextRef.current.close();
            }
            
            // Create audio blob
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              
              try {
                console.log('📤 Sending audio for transcription...');
                
                // Send to voice-to-text edge function
                const { data, error } = await supabase.functions.invoke('voice-to-text', {
                  body: { audio: base64Audio }
                });
                
                if (error) throw error;
                
                console.log('📝 Transcription received:', data.text);
                setTranscribedText(data.text || '');
                resolve(data.text || '');
              } catch (error) {
                console.error('Error transcribing audio:', error);
                toast({
                  title: "Transcription Error",
                  description: "Failed to convert speech to text. Please try again.",
                  variant: "destructive"
                });
                resolve('');
              } finally {
                setIsProcessing(false);
              }
            };
            
            reader.readAsDataURL(audioBlob);
          } catch (error) {
            console.error('Error processing recording:', error);
            setIsProcessing(false);
            resolve('');
          }
        };
        
        mediaRecorderRef.current.stop();
      }
      
      setIsRecording(false);
      setAudioLevel(0);
    });
  }, [toast]);

  const speakText = useCallback(async (text: string) => {
    if (!text.trim()) return;

    try {
      console.log('🔊 Converting text to speech...');
      setIsPlaying(true);

      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const { data, error } = await supabase.functions.invoke('text-to-voice', {
        body: { text }
      });

      if (error) throw error;

      // Create audio element and play
      const audioBlob = new Blob([
        Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        toast({
          title: "Audio Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive"
        });
      };

      await audio.play();
      console.log('🔊 Audio playback started');
    } catch (error) {
      console.error('Error converting text to speech:', error);
      setIsPlaying(false);
      toast({
        title: "Speech Error",
        description: "Failed to convert text to speech. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  const resetTranscription = useCallback(() => {
    setTranscribedText('');
  }, []);

  return {
    isRecording,
    transcribedText,
    isProcessing,
    audioLevel,
    isPlaying,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
    resetTranscription
  };
};
