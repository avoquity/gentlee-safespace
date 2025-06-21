import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { JournalButton } from '../JournalButton';
import { VoiceModeButton } from '../VoiceModeButton';
import { UpgradePrompt } from '../UpgradePrompt';
import { ChatSuggestions } from '../ChatSuggestions';
import { chatSuggestions } from './chatSuggestions';

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
  onVoiceModeClick?: () => void;
}

export const MobileChatInput: React.FC<MobileChatInputProps> = ({
  input,
  setInput,
  handleSubmit,
  hasReachedLimit,
  openJournalModal,
  shouldShowUpgradePrompt,
  messageCount,
  weeklyLimit,
  handleDismissUpgradePrompt,
  onVoiceModeClick = () => {}
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [randomizedSuggestions, setRandomizedSuggestions] = useState<string[]>([]);
  const [lineCount, setLineCount] = useState(1);

  // Auto-resize the textarea when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '3rem';
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, 192);
      textareaRef.current.style.height = `${scrollHeight}px`;
      
      // Calculate line count
      const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight) || 24;
      const contentHeight = textareaRef.current.scrollHeight;
      const calculatedLineCount = Math.ceil(contentHeight / lineHeight);
      setLineCount(calculatedLineCount);
      
      // If line count exceeds 2 and input has content, open journal modal
      if (calculatedLineCount > 2 && input.trim().length > 0) {
        openJournalModal();
      }
    }
  }, [input, openJournalModal]);

  useEffect(() => {
    if (isFocused) {
      const shuffled = [...chatSuggestions].sort(() => 0.5 - Math.random());
      setRandomizedSuggestions(shuffled);
    }
  }, [isFocused]);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleTextareaFocus = () => {
    setIsFocused(true);
    // Only dismiss when approaching limit (not at limit)
    if (messageCount === weeklyLimit - 1 && !hasReachedLimit) {
      handleDismissUpgradePrompt();
    }
  };

  return (
    <>
      <div className="flex items-center w-full mb-2">
        {/* Input area */}
        <div className="flex flex-1 items-center relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasReachedLimit ? "You've reached your weekly message limit" : "Continue your thoughts here..."}
            className={`w-full px-1 py-3 text-lg bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none leading-relaxed pr-14 ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              minHeight: '3rem',
              maxHeight: '12rem',
              height: '3rem',
              overflowY: 'auto'
            }}
            onFocus={handleTextareaFocus}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !hasReachedLimit) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={hasReachedLimit}
          />
          {/* Voice and Journal Buttons */}
          <div className="flex items-center gap-2 ml-3">
            <VoiceModeButton
              onClick={onVoiceModeClick}
              className="w-11 h-11"
            />
            <JournalButton
              onClick={openJournalModal}
              isMobile={true}
            />
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <motion.button
          type="submit"
          aria-label="Send"
          className={`w-[90%] mx-auto py-3 px-6 mt-1 rounded-full border-2 border-deep-charcoal flex items-center justify-center gap-2 text-deep-charcoal font-poppins text-base hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200 ${
            hasReachedLimit ? "opacity-50 cursor-not-allowed" : ""
          }`}
          whileTap={{ scale: hasReachedLimit ? 1 : 0.98 }}
          disabled={hasReachedLimit}
          style={{ borderRadius: 100, marginBottom: 6 }}
        >
          <span>Send</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </form>
      {shouldShowUpgradePrompt && (
        <UpgradePrompt
          messageCount={messageCount}
          weeklyLimit={weeklyLimit}
          onDismiss={hasReachedLimit ? undefined : handleDismissUpgradePrompt}
          className="mb-8"
        />
      )}
      <ChatSuggestions
        suggestions={randomizedSuggestions.length > 0 ? randomizedSuggestions : chatSuggestions}
        inputValue={input}
        onSuggestionClick={handleSuggestionClick}
        isFocused={isFocused && !hasReachedLimit}
        messageCount={messageCount}
      />
    </>
  );
};
