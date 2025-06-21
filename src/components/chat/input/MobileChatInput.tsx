
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { JournalButton } from '../JournalButton';
import { UpgradePrompt } from '../UpgradePrompt';
import { useSubscription } from './useSubscription';

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
  const { subscription } = useSubscription();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!hasReachedLimit) {
        handleSubmit(e);
      }
    }
  };

  return (
    <div className="sticky bottom-0 bg-warm-beige p-4 border-t border-deep-charcoal/10">
      {shouldShowUpgradePrompt && (
        <UpgradePrompt
          messageCount={messageCount}
          weeklyLimit={weeklyLimit}
          hasReachedLimit={hasReachedLimit}
          onDismiss={handleDismissUpgradePrompt}
          className="mb-4"
        />
      )}
      
      <div className="flex items-end gap-2">
        <JournalButton onClick={openJournalModal} />
        
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
    </div>
  );
};
