
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceMode } from '@/hooks/useVoiceMode';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

export const VoiceModal = ({ isOpen, onClose, onSendMessage }: VoiceModalProps) => {
  const {
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
  } = useVoiceMode();

  const [lastAIResponse, setLastAIResponse] = useState('');

  // Handle recording toggle
  const handleRecordingToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      resetTranscription();
      await startRecording();
    }
  };

  // Handle sending transcribed message
  const handleSendTranscription = () => {
    if (transcribedText.trim()) {
      onSendMessage(transcribedText);
      resetTranscription();
    }
  };

  // Mock AI response for demo (in real app, this would come from the chat system)
  useEffect(() => {
    if (transcribedText && !isRecording && !isProcessing) {
      // Simulate AI response - in the real implementation, this would be handled by the chat system
      const mockResponse = "I understand what you're saying. This is a voice response that will be spoken aloud.";
      setLastAIResponse(mockResponse);
      
      // Auto-speak the AI response
      setTimeout(() => {
        speakText(mockResponse);
      }, 1000);
    }
  }, [transcribedText, isRecording, isProcessing, speakText]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-warm-beige z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-deep-charcoal/10">
          <h2 className="text-xl font-poppins font-semibold text-deep-charcoal">
            Voice Mode
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
          
          {/* Voice Level Indicator / Recording Status */}
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-200 ${
                isRecording 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-deep-charcoal bg-white'
              }`}
              animate={{ 
                scale: isRecording ? 1 + (audioLevel * 0.3) : 1,
                borderColor: isRecording ? '#ef4444' : '#1a1a1a'
              }}
              transition={{ duration: 0.1 }}
            >
              {isRecording ? (
                <Mic className="w-12 h-12 text-red-500" />
              ) : (
                <MicOff className="w-12 h-12 text-deep-charcoal" />
              )}
            </motion.div>

            {/* Recording Status */}
            <div className="text-center">
              {isProcessing ? (
                <p className="text-deep-charcoal font-medium">Processing...</p>
              ) : isRecording ? (
                <p className="text-red-500 font-medium">Recording... Tap to stop</p>
              ) : (
                <p className="text-deep-charcoal font-medium">Tap to start recording</p>
              )}
            </div>
          </div>

          {/* Transcribed Text */}
          {transcribedText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl"
            >
              <div className="bg-white rounded-lg p-4 border border-deep-charcoal/10">
                <h3 className="text-sm font-medium text-deep-charcoal mb-2">You said:</h3>
                <p className="text-deep-charcoal">{transcribedText}</p>
              </div>
            </motion.div>
          )}

          {/* AI Response */}
          {lastAIResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl"
            >
              <div className="bg-muted-sage/10 rounded-lg p-4 border border-muted-sage/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-deep-charcoal">AI Response:</h3>
                  <Button
                    onClick={() => isPlaying ? stopSpeaking() : speakText(lastAIResponse)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    {isPlaying ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-deep-charcoal">{lastAIResponse}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-deep-charcoal/10">
          <div className="flex items-center justify-center space-x-4">
            {/* Record Button */}
            <Button
              onClick={handleRecordingToggle}
              disabled={isProcessing}
              className={`h-12 px-8 rounded-full font-medium transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-deep-charcoal hover:bg-deep-charcoal/80 text-white'
              }`}
            >
              {isProcessing ? (
                'Processing...'
              ) : isRecording ? (
                'Stop Recording'
              ) : (
                'Start Recording'
              )}
            </Button>

            {/* Send Transcription Button */}
            {transcribedText && (
              <Button
                onClick={handleSendTranscription}
                className="h-12 px-8 rounded-full bg-muted-sage hover:bg-muted-sage/80 text-white font-medium"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
