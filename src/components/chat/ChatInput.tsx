
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatSuggestions } from './ChatSuggestions';
import { UpgradePrompt } from './UpgradePrompt';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  messageCount?: number;
  weeklyLimit?: number;
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

export const ChatInput = ({ 
  input, 
  setInput, 
  handleSubmit, 
  messageCount = 0, 
  weeklyLimit = 10 
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);
  const [randomizedSuggestions, setRandomizedSuggestions] = useState<string[]>([]);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const { user } = useAuth();
  
  // Check if user has an active subscription
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
  
  // Determine if user has reached limit (never true for subscribed users)
  const hasReachedLimit = !isSubscribed && messageCount >= weeklyLimit;

  // Auto-resize the textarea when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '3rem'; // Reset to minimum height
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

  // Reset the upgrade prompt visibility when message count changes
  useEffect(() => {
    setShowUpgradePrompt(true);
  }, [messageCount]);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleDismissUpgradePrompt = () => {
    setShowUpgradePrompt(false);
  };

  // When focusing on the textarea, hide the approaching limit prompt
  const handleTextareaFocus = () => {
    setIsFocused(true);
    if (messageCount === weeklyLimit - 1) {
      setShowUpgradePrompt(false);
    }
  };

  // Don't show upgrade prompt for subscribed users
  const shouldShowUpgradePrompt = !isSubscribed && user && showUpgradePrompt && 
    (messageCount === weeklyLimit - 1 || messageCount >= weeklyLimit);

  return (
    <form onSubmit={handleSubmit} className="relative mt-16">
      <div 
        className="absolute -top-20 left-0 right-0 h-40 pointer-events-none" 
        style={{ 
          background: 'linear-gradient(to top, rgba(253, 251, 248, 0) 0%, rgba(253, 251, 248, 0.9) 50%, rgba(253, 251, 248, 0) 100%)'
        }} 
      />
      <div className="relative bg-[#FDFBF8]">
        {shouldShowUpgradePrompt && (
          <UpgradePrompt 
            messageCount={messageCount} 
            weeklyLimit={weeklyLimit}
            onDismiss={messageCount === weeklyLimit - 1 ? handleDismissUpgradePrompt : undefined}
            className="mb-8" // Added more bottom margin to create space
          />
        )}
        
        <div className="relative">
          <ChatSuggestions
            suggestions={randomizedSuggestions.length > 0 ? randomizedSuggestions : chatSuggestions}
            inputValue={input}
            onSuggestionClick={handleSuggestionClick}
            isFocused={isFocused && !hasReachedLimit}
            messageCount={messageCount}
          />
          
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={hasReachedLimit ? "You've reached your weekly message limit" : "Continue your thoughts here..."}
              className={`w-full px-1 py-3 pb-4 text-lg bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none leading-relaxed ${isMobile ? 'pr-4' : 'pr-[160px]'} ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                height: '3rem',
                minHeight: '3rem',
                maxHeight: '12rem',
                overflowY: 'auto',
              }}
              onFocus={handleTextareaFocus}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !hasReachedLimit) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={hasReachedLimit}
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
            <span className="font-poppins text-sm">Send</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
        
        {/* Desktop Send Button - Adjusted position for better alignment with text */}
        {!isMobile && (
          <motion.button
            type="submit"
            className={`absolute right-1 bottom-0 mb-3 h-[42px] px-6 rounded-full border-2 border-deep-charcoal flex items-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200 ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileTap={{ scale: hasReachedLimit ? 1 : 0.98 }}
            disabled={hasReachedLimit}
          >
            <span className="font-poppins text-sm">Send</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </form>
  );
};
