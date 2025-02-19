
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const suggestedTopics = [
  "Stress", 
  "Relationships", 
  "Career Change", 
  "Motivation",
  "Healing & Growth",
  "Life Transitions",
  "Inner clarity"
];

const WritingInput = () => {
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // If user is not authenticated, store message and redirect to auth
      if (!user) {
        // Store the message in sessionStorage
        sessionStorage.setItem('pendingMessage', input);
        navigate('/auth', {
          state: { tab: 'signin', redirectTo: '/chat' }
        });
        return;
      }

      // If user is authenticated, proceed to chat
      navigate('/chat', {
        state: { initialMessage: input }
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="relative w-4/5 mx-auto mb-3">
        <div className="relative max-h-48 overflow-hidden">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What's on your mind lately?"
            className="w-full px-1 py-2 text-lg leading-normal align-middle bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 pr-40 min-h-[3rem] resize-none overflow-hidden"
            style={{
              height: 'auto',
              minHeight: '3rem'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          {input.split('\n').length > 3 && (
            <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-soft-ivory to-transparent pointer-events-none" />
          )}
        </div>
        <button
          type="submit"
          className="absolute right-0 top-1/2 -translate-y-1/2 px-6 py-2 rounded-full border border-deep-charcoal flex items-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200"
        >
          <span className="font-poppins text-base">Send</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      
      <div className="flex flex-wrap items-center gap-2 justify-center max-w-2xl mx-auto mt-3">
        {suggestedTopics.map((topic) => (
          <button
            key={topic}
            className="px-6 py-2 rounded-full border border-deep-charcoal bg-transparent text-deep-charcoal text-sm font-poppins cursor-default"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WritingInput;
