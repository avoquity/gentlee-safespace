
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Notebook } from 'lucide-react';
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
  leftAction?: React.ReactNode; // Deprecated in new layout
  onJournalOpen?: () => void,   // New, for explicit journal open
}

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
  weeklyLimit = 10,
  onJournalOpen,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);
  const [randomizedSuggestions, setRandomizedSuggestions] = useState<string[]>([]);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const { user } = useAuth();

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
        const hasActiveSubscription = data?.subscription_status === 'active';
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

  const hasReachedLimit = !isSubscribed && messageCount >= weeklyLimit;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '3rem';
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, 192);
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (isFocused) {
      const shuffled = [...chatSuggestions].sort(() => 0.5 - Math.random());
      setRandomizedSuggestions(shuffled);
    }
  }, [isFocused]);

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

  const handleTextareaFocus = () => {
    setIsFocused(true);
    if (messageCount === weeklyLimit - 1) {
      setShowUpgradePrompt(false);
    }
  };

  const shouldShowUpgradePrompt =
    !isSubscribed &&
    user &&
    showUpgradePrompt &&
    (messageCount === weeklyLimit - 1 || messageCount >= weeklyLimit);

  // NEW: Journal icon as an explicit function - no border, min 44x44, right of textarea (mobile) or send btn (desktop)
  const JournalIconButton = (
    <button
      type="button"
      aria-label="Open journal"
      tabIndex={0}
      onClick={onJournalOpen}
      className={`flex items-center justify-center bg-transparent outline-none border-none select-none transition-colors duration-150
        min-w-[44px] min-h-[44px] rounded-full mx-2
        ${isMobile ? 'mr-0' : 'ml-2'} 
        hover:bg-transparent active:bg-transparent shadow-none`}
      style={{
        padding: 0,
        margin: 0,
        appearance: 'none',
        boxShadow: 'none',
      }}
    >
      <Notebook size={26} className="text-deep-charcoal" />
    </button>
  );

  return (
    <div className="relative mt-16">
      <div
        className="absolute -top-20 left-0 right-0 h-40 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(253, 251, 248, 0) 0%, rgba(253, 251, 248, 0.9) 50%, rgba(253, 251, 248, 0) 100%)'
        }}
      />
      <div className="relative bg-[#FDFBF8]">
        {shouldShowUpgradePrompt && (
          <UpgradePrompt
            messageCount={messageCount}
            weeklyLimit={weeklyLimit}
            onDismiss={messageCount === weeklyLimit - 1 ? handleDismissUpgradePrompt : undefined}
            className="mb-8"
          />
        )}

        <div>
          <ChatSuggestions
            suggestions={randomizedSuggestions.length > 0 ? randomizedSuggestions : chatSuggestions}
            inputValue={input}
            onSuggestionClick={handleSuggestionClick}
            isFocused={isFocused && !hasReachedLimit}
            messageCount={messageCount}
          />

          {/* --- Mobile Layout --- */}
          {isMobile ? (
            <div className="flex flex-col items-center gap-0 w-full pt-2">
              {/* Row: Textarea + Journal icon */}
              <div className="flex w-full items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      hasReachedLimit
                        ? "You've reached your weekly message limit"
                        : "Continue your thoughts here..."
                    }
                    className={`w-full px-1 py-3 pb-4 text-lg bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none leading-relaxed pr-2 ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    aria-label="Chat input"
                  />
                </div>
                {/* Journal icon */}
                {JournalIconButton}
              </div>
              {/* Row: Send button, full-width under textarea */}
              <motion.button
                type="submit"
                className={`mt-4 h-[44px] w-[90vw] max-w-[440px] rounded-full bg-deep-charcoal text-white text-lg font-semibold flex items-center justify-center gap-2 shadow-none border-none transition-all duration-200 ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileTap={{ scale: hasReachedLimit ? 1 : 0.98 }}
                disabled={hasReachedLimit}
                style={{ outline: "none", boxShadow: "none" }}
              >
                <span className="font-poppins text-md">Send</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          ) : (
          /* --- Desktop Layout --- */
            <div className={`flex items-end gap-2 w-full pt-2`}>
              {/* Textarea expands to fill */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    hasReachedLimit
                      ? "You've reached your weekly message limit"
                      : "Continue your thoughts here..."
                  }
                  className={`w-full px-1 py-3 pb-4 text-lg bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none leading-relaxed pr-[120px] ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  aria-label="Chat input"
                />
              </div>
              {/* Send Button */}
              <motion.button
                type="submit"
                className={`h-[44px] min-w-[44px] px-6 rounded-full flex items-center gap-2 text-deep-charcoal bg-deep-charcoal/5 hover:bg-muted-sage hover:text-white transition-all duration-200 ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileTap={{ scale: hasReachedLimit ? 1 : 0.98 }}
                style={{ marginBottom: '8px', border: 'none', outline: 'none', boxShadow: 'none' }}
                disabled={hasReachedLimit}
              >
                <span className="font-poppins text-sm">Send</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              {/* Journal icon, to the right of send */}
              {JournalIconButton}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
