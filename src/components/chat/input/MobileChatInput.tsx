
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff } from 'lucide-react';
import { JournalButton } from '../JournalButton';
import { UpgradePrompt } from '../UpgradePrompt';
import { useSubscription } from './useSubscription';
import { useNativeSpeechToText } from '@/hooks/useNativeSpeechToText';

interface MobileChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  hasReachedLimit: boolean;
  openJournalModal: () => void;
  shouldShowUpgradePrompt: boolean;
  messageCount: number;
  weeklyLimit: number;
  handleDismissUpgradePrompt: () => void;
}

export const MobileChatInput = ({
  input,
  setInput,
  handleSubmit,
  hasReachedLimit,
  openJournalModal,
  shouldShowUpgradePrompt,
  messageCount,
  weeklyLimit,
  handleDismissUpgradePrompt,
}: MobileChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isSubscribed } = useSubscription();
  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useNativeSpeechToText();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Update input with transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript, setInput]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!hasReachedLimit) {
        handleSubmit(e);
      }
    }
  };

  const handleMicrophoneClick = () => {
    if (!isSupported()) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  return (
    <div className="sticky bottom-0 bg-warm-beige p-4 border-t border-deep-charcoal/10">
      {shouldShowUpgradePrompt && (
        <UpgradePrompt
          messageCount={messageCount}
          weeklyLimit={weeklyLimit}
          onDismiss={handleDismissUpgradePrompt}
          className="mb-4"
        />
      )}
      
      <div className="flex items-end gap-3">
        <JournalButton onClick={openJournalModal} isMobile={true} />
        
        <Button
          onClick={handleMicrophoneClick}
          variant="ghost"
          size="sm"
          disabled={hasReachedLimit}
          className={`h-10 w-10 p-0 rounded-full transition-colors ${
            isListening 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'hover:bg-deep-charcoal/10'
          }`}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
        
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={hasReachedLimit ? "Weekly limit reached - upgrade to continue" : "Share what's on your mind..."}
            disabled={hasReachedLimit}
            className="min-h-[44px] max-h-32 resize-none border-none bg-transparent text-deep-charcoal placeholder:text-deep-charcoal/50 focus:ring-0 focus:border-none pr-12"
            style={{ 
              borderBottom: '1px solid rgba(26, 26, 26, 0.2)',
              borderRadius: '0'
            }}
          />
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!input.trim() || hasReachedLimit}
            className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-deep-charcoal hover:bg-deep-charcoal/80 text-white rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};
