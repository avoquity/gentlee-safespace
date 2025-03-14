
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, format } from 'date-fns';
import { ChatSuggestions } from './chat/ChatSuggestions';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

// Suggested topics as buttons below the input
const suggestedTopics = [
  "Stress", 
  "Relationships", 
  "Career Change", 
  "Motivation",
  "Healing & Growth",
  "Life Transitions",
  "Inner clarity"
];

// Chat suggestions - updated with more reflective prompts
const chatSuggestions = [
  "What truth have I been avoiding?",
  "What would I say to my younger self right now?",
  "What's a small, kind thing I can do for myself today?",
  "What would this look like from a different lens?",
  "What's one thing I know deep down, but forget too often?",
  "If my heart could speak, what would it say?",
  "How can I be a little softer with myself?",
  "Tell me something I might not be seeing."
];

const WritingInput = () => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [randomizedSuggestions, setRandomizedSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  
  // Randomize suggestions when input field is focused
  useEffect(() => {
    if (isFocused) {
      const shuffled = [...chatSuggestions].sort(() => 0.5 - Math.random());
      setRandomizedSuggestions(shuffled);
    }
  }, [isFocused]);
  
  const findTodayChat = async () => {
    if (!user) return null;
    
    const today = startOfDay(new Date());
    
    const { data: existingChat, error } = await supabase
      .from('chat')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())
      .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) {
      console.error('Error finding today\'s chat:', error);
      return null;
    }

    return existingChat;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // If user is not authenticated, store message and redirect to auth
    if (!user) {
      sessionStorage.setItem('pendingMessage', input);
      navigate('/auth', {
        state: { tab: 'signin', redirectTo: '/chat' }
      });
      return;
    }

    try {
      // Check if there's a chat for today
      const todayChat = await findTodayChat();

      if (todayChat) {
        // If chat exists, navigate to it with the message
        navigate(`/chat/${todayChat.id}`, {
          state: { 
            initialMessage: input,
            entryDate: format(new Date(), 'd MMMM yyyy') // Add today's date for header
          }
        });
      } else {
        // If no chat exists for today, create a new one
        navigate('/chat', {
          state: { 
            initialMessage: input,
            entryDate: format(new Date(), 'd MMMM yyyy') // Add today's date for header
          }
        });
      }
    } catch (error) {
      console.error('Error handling chat submission:', error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="relative w-full mx-auto mb-3">
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
            placeholder="What's on your mind lately?"
            className="w-full px-1 py-3 text-lg leading-normal align-middle bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 pr-40 resize-none overflow-hidden"
            style={{
              height: '3rem',
              minHeight: '3rem'
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = '3rem';
              if (target.value) {
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 192)}px`;
              }
            }}
          />
        </div>
        <motion.button
          type="submit"
          className="absolute right-0 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-full border border-deep-charcoal flex items-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200"
          whileTap={{ scale: 0.98 }}
        >
          <span className="font-poppins text-base">Send</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
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
