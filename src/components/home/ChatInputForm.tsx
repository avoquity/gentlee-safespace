
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInputFormProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  hasReachedLimit: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  isHomepage?: boolean;
}

const ChatInputForm = ({ 
  input, 
  setInput, 
  handleSubmit, 
  hasReachedLimit, 
  textareaRef,
  isHomepage = false
}: ChatInputFormProps) => {
  const isMobile = useIsMobile();
  const [lineCount, setLineCount] = useState(1);

  // Handle keyboard submission on homepage
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isHomepage && e.key === 'Enter' && !e.shiftKey && !hasReachedLimit) {
      e.preventDefault(); // Prevent new line
      handleSubmit(e); // Submit the form
    }
  };

  // Auto-resize the textarea when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '3rem'; // Reset to minimum height
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, 192);
      textareaRef.current.style.height = `${scrollHeight}px`;
      
      // Calculate line count
      const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight) || 24;
      const contentHeight = textareaRef.current.scrollHeight;
      const calculatedLineCount = Math.ceil(contentHeight / lineHeight);
      setLineCount(calculatedLineCount);
    }
  }, [input, textareaRef]);

  return (
    <form onSubmit={handleSubmit} className="relative w-full mx-auto mb-3">
      <div className="relative">
        <div className="relative flex">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasReachedLimit 
              ? "You've reached your weekly chat limit. Please upgrade to Reflection plan to continue." 
              : "What's on your mind lately?"}
            className={`w-full px-1 py-3 text-lg leading-normal align-middle bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none overflow-y-auto ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              height: '3rem',
              minHeight: '3rem',
              maxHeight: '12rem',
              // Increased padding to create more space between text and button
              paddingRight: isMobile ? '24px' : '180px'
            }}
            disabled={hasReachedLimit}
            autoFocus
          />
        </div>
      </div>
      
      {/* Mobile Full-Width Send Button */}
      {isMobile && (
        <motion.button
          type="submit"
          className={`w-full mt-4 py-3 px-6 rounded-full border-2 border-deep-charcoal flex items-center justify-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200 ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileTap={{ scale: hasReachedLimit ? 1 : 0.98 }}
          disabled={hasReachedLimit}
        >
          <span className="font-poppins text-sm">Start a free chat</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
      
      {/* Desktop Send Button - Positioned lower to align with text */}
      {!isMobile && (
        <motion.button
          type="submit"
          className={`absolute right-1 bottom-0 mb-3 h-[42px] px-6 rounded-full border-2 border-deep-charcoal flex items-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200 ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileTap={{ scale: hasReachedLimit ? 1 : 0.98 }}
          disabled={hasReachedLimit}
        >
          <span className="font-poppins text-sm">Start a free chat</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </form>
  );
};

export default ChatInputForm;
