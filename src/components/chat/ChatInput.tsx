
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

// Chat suggestions - updated with more reflective prompts
const chatSuggestions = [
  "What truth have I been avoiding?",
  "What would I say to my younger self right now?",
  "What's a small, kind thing I can do for myself today?",
  "What would this look like from a different lens?",
  "What's one thing I know deep down, but forget too often?",
  "If my heart could speak, what would it say?",
  "Give me words to breathe in, words to hold onto.",
  "Tell me a small truth wrapped in kindness."
];

export const ChatInput = ({ input, setInput, handleSubmit }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);
  const [randomizedSuggestions, setRandomizedSuggestions] = useState<string[]>([]);

  // Auto-resize the textarea when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, 192);
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  // Randomize suggestions when input field is focused
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
            suggestions={randomizedSuggestions.length > 0 ? randomizedSuggestions : chatSuggestions}
            inputValue={input}
            onSuggestionClick={handleSuggestionClick}
            isFocused={isFocused}
          />
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Continue your thoughts here..."
            className="w-full px-1 py-3 text-lg bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none leading-relaxed pr-4"
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
