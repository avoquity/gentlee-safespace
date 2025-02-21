
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({ input, setInput, handleSubmit }: ChatInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(input.length > 0);
  }, [input]);

  return (
    <div className="relative">
      {/* Gradient overlay */}
      <div 
        className="absolute -top-24 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent, ${isTyping ? 'rgba(253, 251, 248, 0.95)' : 'rgba(253, 251, 248, 0.85)'})`
        }}
      />
      
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Continue your thoughts here..."
          className="w-full px-4 py-3 pr-48 text-sm rounded-lg border-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none leading-relaxed"
          style={{
            minHeight: '3rem',
            maxHeight: '12rem',
            overflowY: 'auto',
            backgroundColor: isTyping || isFocused ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)',
            transition: 'background-color 0.2s ease-in-out',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 192)}px`;
          }}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-[45px] px-6 rounded-full border-2 border-deep-charcoal flex items-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200"
        >
          <span className="font-poppins text-sm">Send</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
