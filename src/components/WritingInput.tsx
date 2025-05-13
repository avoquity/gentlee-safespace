import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useSubscription } from '@/hooks/useSubscription';
import { useTodayChat } from '@/hooks/useTodayChat';
import ChatInputForm from './home/ChatInputForm';
import ChatSuggestionsDisplay from './home/ChatSuggestionsDisplay';
import UpgradeLink from './home/UpgradeLink';
import HeroTestimonial from './home/HeroTestimonial';


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

const WritingInput = () => {
  const [input, setInput] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isSubscribed, isSubscriptionLoading } = useSubscription();
  const { findTodayChat } = useTodayChat();
  
  // Generate random suggestions on component mount
  useEffect(() => {
    // Shuffle the array and take first 3-4 elements
    const shuffled = [...chatSuggestions].sort(() => 0.5 - Math.random());
    // Randomly decide between 3 or 4 suggestions
    const count = Math.random() > 0.5 ? 3 : 4;
    setRandomSuggestions(shuffled.slice(0, count));
  }, []);
  
  // Only apply limit if user is not subscribed
  const hasReachedLimit = !isSubscribed && messageCount >= WEEKLY_MESSAGE_LIMIT;
  
  // Auto-focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

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

      // Ensure the suggestion is properly stored for Chat page to process
      sessionStorage.setItem('initialMessage', suggestion);
      console.log('Setting suggestion to session storage:', suggestion);

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

  return (
    <div className="w-full mx-auto flex flex-col gap-4">
      <ChatInputForm
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        hasReachedLimit={hasReachedLimit}
        textareaRef={textareaRef}
      />
      
      {hasReachedLimit && <UpgradeLink />}
      
      {/* Chat Suggestions */}
      <ChatSuggestionsDisplay
        suggestions={randomSuggestions}
        onSuggestionClick={handleSuggestionClick}
        hasReachedLimit={hasReachedLimit}
      />
      
    </div>
  );
};

export default WritingInput;
