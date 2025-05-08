
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, format } from 'date-fns';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatSuggestions } from '@/components/chat/ChatSuggestions';

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

// Suggestion prompts similar to chat page
const suggestionPrompts = [
  "What's one thing I know deep down, but forget too often?",
  "Tell me a small truth wrapped in kindness.",
  "If my heart could speak, what would it say?",
  "What would I say to my younger self right now?",
  "What would this look like from a different lens?"
];

// Weekly message limit for free users
const WEEKLY_MESSAGE_LIMIT = 10;

// Storage key for the first visit timestamp
const FIRST_VISIT_KEY = 'gentlee_first_visit';

interface TodayChat {
  id: number;
}

const WritingInput = () => {
  const [input, setInput] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  
  // Check first visit status and show suggestions
  useEffect(() => {
    const firstVisitTimestamp = localStorage.getItem(FIRST_VISIT_KEY);
    const currentTime = new Date().getTime();
    
    // If no timestamp or it's been more than 30 days
    if (!firstVisitTimestamp || (currentTime - parseInt(firstVisitTimestamp)) > 30 * 24 * 60 * 60 * 1000) {
      localStorage.setItem(FIRST_VISIT_KEY, currentTime.toString());
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, []);
  
  // Auto-focus the textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  // Check subscription status
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user) {
        setIsSubscriptionLoading(false);
        return;
      }
      
      try {
        setIsSubscriptionLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_current_period_end')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        // Check if user has an active subscription
        const hasActiveSubscription = data?.subscription_status === 'active';
        
        // Check if subscription is still valid (not expired)
        const isStillValid = data?.subscription_current_period_end 
          ? new Date(data.subscription_current_period_end) > new Date() 
          : false;
        
        setIsSubscribed(hasActiveSubscription && isStillValid);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setIsSubscribed(false);
      } finally {
        setIsSubscriptionLoading(false);
      }
    };
    
    checkSubscriptionStatus();
  }, [user]);
  
  // Only apply limit if user is not subscribed
  const hasReachedLimit = !isSubscribed && messageCount >= WEEKLY_MESSAGE_LIMIT;
  
  // Fixed version that explicitly returns the properly typed object
  const findTodayChat = async (): Promise<TodayChat | null> => {
    if (!user) return null;
    
    const today = startOfDay(new Date());
    
    // Use maybeSingle() instead of single() to handle cases when no results are found
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
    if (!input.trim() || hasReachedLimit) return;

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

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Auto-resize the textarea when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '3rem'; // Reset to minimum height
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, 192);
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="w-full mx-auto flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="relative w-full mx-auto mb-3">
        <div className="relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={hasReachedLimit 
                ? "You've reached your weekly chat limit. Please upgrade to Reflection plan to continue." 
                : "What's on your mind lately?"}
              className={`w-full px-1 py-3 text-lg leading-normal align-middle bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 ${isMobile ? 'pr-4' : 'pr-[160px]'} resize-none overflow-y-auto ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                height: '3rem',
                minHeight: '3rem',
                maxHeight: '12rem'
              }}
              disabled={hasReachedLimit}
              autoFocus
            />
            
            {/* Suggestion prompts - show when focused and suggestions are enabled */}
            {showSuggestions && (
              <ChatSuggestions 
                suggestions={suggestionPrompts}
                inputValue={input}
                onSuggestionClick={handleSuggestionClick}
                isFocused={isInputFocused}
              />
            )}
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
      
      {hasReachedLimit && (
        <div className="w-full text-center mb-4">
          <Link to="/upgrade" className="text-muted-sage hover:underline text-sm">
            Upgrade to Reflection plan
          </Link>
        </div>
      )}
      
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
