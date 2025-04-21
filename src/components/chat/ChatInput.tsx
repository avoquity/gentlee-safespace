
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatSuggestions } from './ChatSuggestions';
import { UpgradePrompt } from './UpgradePrompt';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { JournalButton } from './JournalButton';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  messageCount?: number;
  weeklyLimit?: number;
  onJournalClick?: () => void;
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
  onJournalClick = () => {},
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

  const handleDismissUpgradePrompt = () => setShowUpgradePrompt(false);

  const handleTextareaFocus = () => {
    setIsFocused(true);
    if (messageCount === weeklyLimit - 1) {
      setShowUpgradePrompt(false);
    }
  };

  const shouldShowUpgradePrompt = !isSubscribed && user && showUpgradePrompt &&
    (messageCount === weeklyLimit - 1 || messageCount >= weeklyLimit);

  // --- Render ---

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="relative w-full flex flex-col gap-0">
        <div className="flex items-center w-full mb-2">
          {/* Input area */}
          <div className="flex flex-1 items-center relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={hasReachedLimit ? "You've reached your weekly message limit" : "Continue your thoughts here..."}
              className={`w-full px-1 py-3 text-lg bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none leading-relaxed pr-14 ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                minHeight: '3rem',
                maxHeight: '12rem',
                height: '3rem',
                overflowY: 'auto'
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
            {/* JournalButton right of input, outside the send button: */}
            <div
              className="flex-shrink-0 ml-3"
              style={{ minWidth: 44, minHeight: 44 }}
              aria-label="Journal mode"
              title="Journal mode"
            >
              <JournalButton
                onClick={onJournalClick}
                isMobile={true}
              />
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <motion.button
            type="submit"
            aria-label="Send"
            className={`w-[90%] mx-auto py-3 px-6 mt-1 rounded-full border-2 border-deep-charcoal flex items-center justify-center gap-2 text-deep-charcoal font-poppins text-base hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200 ${
              hasReachedLimit ? "opacity-50 cursor-not-allowed" : ""
            }`}
            whileTap={{ scale: hasReachedLimit ? 1 : 0.98 }}
            disabled={hasReachedLimit}
            style={{ borderRadius: 100, marginBottom: 6 }}
          >
            <span>Send</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>
        {shouldShowUpgradePrompt && (
          <UpgradePrompt
            messageCount={messageCount}
            weeklyLimit={weeklyLimit}
            onDismiss={messageCount === weeklyLimit - 1 ? handleDismissUpgradePrompt : undefined}
            className="mb-8"
          />
        )}
        <ChatSuggestions
          suggestions={randomizedSuggestions.length > 0 ? randomizedSuggestions : chatSuggestions}
          inputValue={input}
          onSuggestionClick={handleSuggestionClick}
          isFocused={isFocused && !hasReachedLimit}
          messageCount={messageCount}
        />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="relative w-full flex flex-col gap-2">
      {shouldShowUpgradePrompt && (
        <UpgradePrompt
          messageCount={messageCount}
          weeklyLimit={weeklyLimit}
          onDismiss={messageCount === weeklyLimit - 1 ? handleDismissUpgradePrompt : undefined}
          className="mb-4"
        />
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-3 w-full">
        <ChatSuggestions
          suggestions={randomizedSuggestions.length > 0 ? randomizedSuggestions : chatSuggestions}
          inputValue={input}
          onSuggestionClick={handleSuggestionClick}
          isFocused={isFocused && !hasReachedLimit}
          messageCount={messageCount}
        />
        <div className="flex-1 flex flex-col">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasReachedLimit ? "You've reached your weekly message limit" : "Continue your thoughts here..."}
            className={`w-full px-1 py-3 text-lg bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none leading-relaxed pr-14 ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              minHeight: '3rem',
              maxHeight: '12rem',
              height: '3rem',
              overflowY: 'auto'
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
        <JournalButton
          onClick={onJournalClick}
          isMobile={false}
          className="ml-2"
        />
        <motion.button
          type="submit"
          aria-label="Send"
          className={`h-[42px] px-6 rounded-full border-2 border-deep-charcoal flex items-center gap-2 text-deep-charcoal font-poppins text-base hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200 ${
            hasReachedLimit ? "opacity-50 cursor-not-allowed" : ""
          }`}
          whileTap={{ scale: hasReachedLimit ? 1 : 0.98 }}
          disabled={hasReachedLimit}
          style={{ borderRadius: 100, marginLeft: 8 }}
        >
          <span>Send</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </form>
    </div>
  );
};

