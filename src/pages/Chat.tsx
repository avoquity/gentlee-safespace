import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

interface LocationState {
  initialMessage?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatEntry {
  id: string;
  messages: Message[];
  date: Date;
  themes: string[];
}

const Chat = () => {
  const location = useLocation();
  const { initialMessage } = (location.state as LocationState) || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [savedEntries, setSavedEntries] = useState<ChatEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date();
  const navigate = useNavigate();

  // Function to identify themes based on message content
  const identifyThemes = (messages: Message[]): string[] => {
    const commonThemes = [
      'Anxiety', 'Growth', 'Relationships', 'Career',
      'Self-discovery', 'Healing', 'Goals', 'Changes'
    ];
    
    const messageText = messages.map(m => m.text.toLowerCase()).join(' ');
    return commonThemes.filter(theme => 
      messageText.includes(theme.toLowerCase())
    );
  };

  // Function to save current chat as an entry
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
      // Here you would typically also save to localStorage or a backend
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCloseConversation = () => {
    saveCurrentChat();
    navigate('/entries');
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
        <div className="max-w-4xl mx-auto pt-24 pb-32 px-4 sm:px-6">
          <div className="mb-10">
            <h1 className="text-[68px] font-bold text-deep-charcoal leading-none">
              {format(currentDate, 'd MMMM yyyy')}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {messages.length > 0 ? (
                identifyThemes(messages).map((theme) => (
                  <span
                    key={theme}
                    className="px-4 py-1.5 text-sm rounded-full border border-deep-charcoal text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-colors"
                  >
                    {theme}
                  </span>
                ))
              ) : (
                <span className="px-4 py-1.5 text-sm rounded-full border border-deep-charcoal/20 text-deep-charcoal/40">
                  No theme yet
                </span>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-6 py-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-white shadow-sm'
                      : 'bg-transparent'
                  }`}
                >
                  <p className="text-deep-charcoal text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-transparent max-w-[80%] px-6 py-4 rounded-2xl">
                  <div className="flex space-x-2">
                    <span className="w-2 h-2 bg-deep-charcoal/40 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-deep-charcoal/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-deep-charcoal/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            {messages.length > 0 && messages[messages.length - 1].sender === 'ai' && (
              <div className="flex justify-start mt-8">
                <div className="text-sm text-deep-charcoal/60">
                  This is great. I feel much better. Thank you for the time and{' '}
                  <button
                    onClick={handleCloseConversation}
                    className="text-deep-charcoal/60 hover:underline focus:outline-none"
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
          <form onSubmit={handleSubmit} className="relative">
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
        </div>
      </div>
    </div>
  );
};

export default Chat;
