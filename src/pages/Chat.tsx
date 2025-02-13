
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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

const Chat = () => {
  const location = useLocation();
  const { initialMessage } = (location.state as LocationState) || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let response = '';
    if (messages.length === 0) {
      response = `Thank you for sharing that with me. I can sense there's a lot on your mind. Would you like to tell me more about what's making you feel this way?`;
    } else {
      response = `I understand. Let's explore that further. What aspects of this situation do you find most challenging?`;
    }

    // Simulate typing effect
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

  return (
    <div className="min-h-screen bg-soft-ivory flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto pt-24 pb-32 px-4">
          <div className="mb-8">
            <h2 className="text-deep-charcoal/60 text-sm font-medium">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>

          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-white shadow-sm'
                      : 'bg-transparent'
                  }`}
                >
                  <p className="text-deep-charcoal whitespace-pre-wrap">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-transparent max-w-[80%] p-4 rounded-2xl">
                  <div className="flex space-x-2">
                    <span className="w-2 h-2 bg-deep-charcoal/40 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-deep-charcoal/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-deep-charcoal/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-soft-ivory via-soft-ivory to-transparent py-6">
        <div className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Continue your thoughts here..."
              className="w-full px-4 py-3 pr-24 text-lg bg-white rounded-xl shadow-sm border border-deep-charcoal/10 focus:outline-none focus:border-deep-charcoal/20 text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-deep-charcoal text-white hover:bg-muted-sage transition-colors duration-200 flex items-center gap-2"
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
