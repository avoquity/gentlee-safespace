
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatThemes } from '@/components/chat/ChatThemes';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { identifyThemes } from '@/utils/themeUtils';
import { Message, ChatEntry, LocationState } from '@/types/chat';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { initialMessage } = (location.state as LocationState) || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [savedEntries, setSavedEntries] = useState<ChatEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date();

  const saveCurrentChat = () => {
    if (messages.length > 0) {
      const themes = identifyThemes(messages);
      const newEntry: ChatEntry = {
        id: Date.now().toString(),
        messages: [...messages],
        date: new Date(),
        themes
      };
      
      setSavedEntries(prev => [...prev, newEntry]);
    }
  };

  const handleCloseConversation = () => {
    if (messages.length > 0) {
      saveCurrentChat();
    }
    navigate('/entries');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let response = '';
    if (messages.length === 0) {
      response = `Thank you for sharing that with me. I can sense there's a lot on your mind. Would you like to tell me more about what's making you feel this way?`;
    } else {
      response = `I understand. Let's explore that further. What aspects of this situation do you find most challenging?`;
    }

    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.sender === 'ai' && lastMessage.id === 'typing') {
          const updatedMessages = [...prev.slice(0, -1)];
          return [...updatedMessages, {
            id: 'typing',
            text: response.slice(0, i + 1),
            sender: 'ai',
            timestamp: new Date()
          }];
        }
        return prev;
      });
    }

    setIsTyping(false);
    setMessages(prev => [
      ...prev.filter(m => m.id !== 'typing'),
      {
        id: Date.now().toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
    
    // Save chat entry after AI responds
    saveCurrentChat();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    await simulateAIResponse(input);
  };

  useEffect(() => {
    if (initialMessage) {
      const firstMessage = {
        id: Date.now().toString(),
        text: initialMessage,
        sender: 'user' as const,
        timestamp: new Date()
      };
      setMessages([firstMessage]);
      simulateAIResponse(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load saved entries from storage on mount
  useEffect(() => {
    const storedEntries = localStorage.getItem('chatEntries');
    if (storedEntries) {
      setSavedEntries(JSON.parse(storedEntries));
    }
  }, []);

  // Save entries to storage when they change
  useEffect(() => {
    if (savedEntries.length > 0) {
      localStorage.setItem('chatEntries', JSON.stringify(savedEntries));
    }
  }, [savedEntries]);

  return (
    <div className="min-h-screen bg-soft-ivory flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto pt-24 pb-32 px-4 sm:px-6 relative">
          {/* Logo */}
          <Link 
            to="/"
            className="absolute left-6 top-8 text-2xl font-bold text-deep-charcoal hover:text-dusty-rose transition-colors"
          >
            Lumi
          </Link>

          {/* Close button */}
          <button
            onClick={handleCloseConversation}
            className="absolute right-6 top-8 p-2 text-deep-charcoal/60 hover:text-dusty-rose transition-colors"
            aria-label="Close conversation"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-10">
            <h1 className="text-[68px] font-bold text-deep-charcoal leading-none">
              {format(currentDate, 'd MMMM yyyy')}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <ChatThemes 
                themes={identifyThemes(messages)} 
                hasMessages={messages.length > 0} 
              />
            </div>
          </div>

          <div className="space-y-8">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <ChatTypingIndicator />}
            {messages.length > 0 && messages[messages.length - 1].sender === 'ai' && (
              <div className="flex justify-center mt-8">
                <div className="text-xs text-dusty-rose">
                  This is great. I feel much better. Thank you for the time and{' '}
                  <button
                    onClick={handleCloseConversation}
                    className="text-dusty-rose underline hover:opacity-80 focus:outline-none"
                  >
                    close this conversation
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-soft-ivory via-soft-ivory to-transparent py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ChatInput 
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
