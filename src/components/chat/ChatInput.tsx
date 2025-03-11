
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({ input, setInput, handleSubmit }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Auto-resize the textarea when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, 192);
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className="relative mt-16">
      <div 
        className="absolute -top-20 left-0 right-0 h-40 pointer-events-none" 
        style={{ 
          background: 'linear-gradient(to top, rgba(253, 251, 248, 0) 0%, rgba(253, 251, 248, 0.9) 50%, rgba(253, 251, 248, 0) 100%)'
        }} 
      />
      <div className="relative bg-[#FDFBF8]">
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        {/* Mobile Full-Width Send Button */}
        {isMobile && (
          <button
            type="submit"
            className="w-full mt-4 py-3 px-6 rounded-full border-2 border-deep-charcoal flex items-center justify-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200"
          >
            <span className="font-poppins text-sm">Send</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        
        {/* Desktop Send Button */}
        {!isMobile && (
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-[50px] px-6 rounded-full border-2 border-deep-charcoal flex items-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200"
          >
            <span className="font-poppins text-sm">Send</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
};
