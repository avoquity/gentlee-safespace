
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';
import WritingInput from '../WritingInput';
import UpgradePrompt from './UpgradePrompt';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (message: string) => void;
  isTyping: boolean;
  messageCount: number;
  weeklyLimit: number;
  hasSubscription?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSubmit,
  isTyping,
  messageCount,
  weeklyLimit,
  hasSubscription = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping && (hasSubscription || messageCount < weeklyLimit)) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isTyping && (hasSubscription || messageCount < weeklyLimit)) {
        onSubmit(input.trim());
        setInput('');
      }
    }
  };

  const hasReachedLimit = !hasSubscription && messageCount >= weeklyLimit;

  return (
    <div className="bg-white/80 backdrop-blur-md border-t border-muted p-3 md:p-4 relative">
      {hasReachedLimit && (
        <UpgradePrompt />
      )}
      
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div 
          className={`
            flex items-end gap-2 p-3 rounded-lg transition-all
            ${isFocused ? 'bg-white shadow-md' : 'bg-gray-50'}
          `}
        >
          <WritingInput
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            disabled={isTyping || hasReachedLimit}
          />
          
          <Button 
            type="submit" 
            size="icon"
            className={`shrink-0 h-10 w-10 rounded-full ${hasReachedLimit ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed' : 'bg-muted-sage hover:bg-deep-charcoal'}`}
            disabled={!input.trim() || isTyping || hasReachedLimit}
          >
            {hasReachedLimit ? (
              <Sparkles className="h-5 w-5 text-white" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
