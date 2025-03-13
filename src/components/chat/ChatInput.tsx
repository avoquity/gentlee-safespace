
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatSuggestions } from './ChatSuggestions';
import { motion } from 'framer-motion';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

// Chat suggestions
const chatSuggestions = [
  "What's been on my mind lately",
  "I'm feeling anxious about",
  "Something I'm grateful for today",
  "A challenge I'm facing is",
  "I'd like to explore my feelings about",
  "What would help me feel more peaceful",
  "I've been thinking about my relationship with",
  "One thing I'd like to change is"
];

export const ChatInput = ({ input, setInput, handleSubmit }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize the textarea when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, 192);
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-16">
      <div 
        className="absolute -top-20 left-0 right-0 h-40 pointer-events-none" 
        style={{ 
          background: 'linear-gradient(to top, rgba(253, 251, 248, 0) 0%, rgba(253, 251, 248, 0.9) 50%, rgba(253, 251, 248, 0) 100%)'
        }} 
      />
      <div className="relative bg-[#FDFBF8]">
        <div className="relative">
          <ChatSuggestions
            suggestions={chatSuggestions}
            inputValue={input}
            onSuggestionClick={handleSuggestionClick}
            isFocused={isFocused}
          />
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Continue your thoughts here..."
            className="w-full px-1 py-3 text-lg bg-transparent border-b-[8px] border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none leading-relaxed pr-4"
            style={{
              height: '3rem',
              minHeight: '3rem',
              maxHeight: '12rem',
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        
        {/* Mobile Full-Width Send Button */}
        {isMobile && (
          <motion.button
            type="submit"
            className="w-full mt-3 py-3 px-6 rounded-full border-2 border-deep-charcoal flex items-center justify-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200"
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-poppins text-sm">Send</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
        
        {/* Desktop Send Button */}
        {!isMobile && (
          <motion.button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-[50px] px-6 rounded-full border-2 border-deep-charcoal flex items-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200"
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-poppins text-sm">Send</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </form>
  );
};
