
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({ input, setInput, handleSubmit }: ChatInputProps) => {
  return (
    <form onSubmit={handleSubmit} className="relative mt-10">
      <div className="absolute -top-40 left-0 right-0 h-40 pointer-events-none bg-gradient-to-t from-soft-ivory via-soft-ivory to-transparent" 
        style={{ opacity: '0.9' }} 
      />
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Continue your thoughts here..."
        className="w-full px-1 py-2 pr-48 text-sm bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none leading-relaxed"
        style={{
          minHeight: '3rem',
          maxHeight: '12rem'
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
          
          // Scroll chat up when typing near existing messages
          const chatContainer = document.querySelector('.chat-messages-container');
          if (chatContainer) {
            const inputTop = target.getBoundingClientRect().top;
            const lastMessage = chatContainer.lastElementChild;
            if (lastMessage) {
              const lastMessageBottom = lastMessage.getBoundingClientRect().bottom;
              const minGap = 40; // increased minimum gap to 40px
              if (inputTop - lastMessageBottom < minGap) {
                chatContainer.scrollTop += minGap - (inputTop - lastMessageBottom);
              }
            }
          }
        }}
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-[50px] px-6 rounded-full border-2 border-deep-charcoal flex items-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200"
      >
        <span className="font-poppins text-sm">Send</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};
