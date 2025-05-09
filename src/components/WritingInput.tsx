import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, format } from 'date-fns';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

// Suggested topics as buttons below the input (existing feature)
const suggestedTopics = [
  "Stress", 
  "Relationships", 
  "Career Change", 
  "Motivation",
  "Healing & Growth",
  "Life Transitions",
  "Inner clarity"
];

// Chat suggestions that appear as conversation starters
const chatSuggestions = [
  "My thoughts feel like a tangled ball of yarn right now.",
  "I'm carrying a heavy feeling I can't quite name.",
  "A conversation keeps replaying in my head and it's exhausting me.",
  "Anxious energy followed me all day and I need a breather.",
  "I just want a safe space to vent for a minute.",
  "I'm overwhelmed by all the decisions in front of me.",
  "I had a small win today, yet I still feel off balance.",
  "Before I sleep, I'd love to set my worries down."
];

// Weekly message limit for free users
const WEEKLY_MESSAGE_LIMIT = 10;

interface TodayChat {
  id: number;
}

const WritingInput = () => {
  const [input, setInput] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  
  // Generate random suggestions on component mount
  useEffect(() => {
    // Shuffle the array and take first 3-4 elements
    const shuffled = [...chatSuggestions].sort(() => 0.5 - Math.random());
    // Randomly decide between 3 or 4 suggestions
    const count = Math.random() > 0.5 ? 3 : 4;
    setRandomSuggestions(shuffled.slice(0, count));
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
  
  // Find today's chat
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

  // Handle clicking on a chat suggestion
  const handleSuggestionClick = async (suggestion: string) => {
    if (hasReachedLimit) return;
    
    // If user is not authenticated, store message and redirect to auth
    if (!user) {
      sessionStorage.setItem('pendingMessage', suggestion);
      navigate('/auth', {
        state: { tab: 'signin', redirectTo: '/chat' }
      });
      return;
    }

    try {
      // Check if there's a chat for today
      const todayChat = await findTodayChat();

      if (todayChat) {
        // If chat exists, navigate to it with the suggestion as the message
        navigate(`/chat/${todayChat.id}`, {
          state: { 
            initialMessage: suggestion,
            entryDate: format(new Date(), 'd MMMM yyyy') // Add today's date for header
          }
        });
      } else {
        // If no chat exists for today, create a new one
        navigate('/chat', {
          state: { 
            initialMessage: suggestion,
            entryDate: format(new Date(), 'd MMMM yyyy') // Add today's date for header
          }
        });
      }
    } catch (error) {
      console.error('Error handling suggestion click:', error);
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
  
  // Auto-focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="w-full mx-auto flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="relative w-full mx-auto mb-3">
        <div className="relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
      
      {/* Chat Suggestions (updated styling to match the pill design in the image) */}
      <div className="flex flex-col items-center justify-center space-y-3 mt-4 mb-8 w-full max-w-2xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3 w-full">
          {randomSuggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-6 py-3 rounded-full border border-deep-charcoal bg-transparent text-deep-charcoal hover:bg-gray-50 transition-all duration-200 text-sm font-poppins"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={hasReachedLimit}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Topic Tags - Unchanged but matching the same pill styling as in image */}
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
