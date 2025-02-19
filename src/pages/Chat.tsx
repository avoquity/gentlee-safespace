import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { X, Volume2, VolumeX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatThemes } from '@/components/chat/ChatThemes';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { identifyThemes } from '@/utils/themeUtils';
import { Message, LocationState } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { initialMessage, chatId: existingChatId } = (location.state as LocationState) || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(existingChatId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date();
  const [isMuted, setIsMuted] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [showHighlightTooltip, setShowHighlightTooltip] = useState(false);

  // Fetch messages for existing chat
  const { data: chatMessages } = useQuery({
    queryKey: ['messages', currentChatId],
    queryFn: async () => {
      if (!currentChatId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('content, user_role, created_at')
        .eq('chat_id', currentChatId)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Error loading messages",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }

      return data.map(msg => ({
        id: msg.created_at,
        text: msg.content,
        sender: msg.user_role as 'user' | 'ai',
        timestamp: new Date(msg.created_at)
      }));
    },
    enabled: !!currentChatId
  });

  // Handle successful messages fetch
  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const createNewChat = async () => {
    try {
      const { data, error } = await supabase
        .from('chat')
        .insert([{ 
          last_updated: new Date().toISOString(),
          theme: null,
          summary: null,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      toast({
        title: "Error creating chat",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const saveMessage = async (message: Message, chatId: number) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          content: message.text,
          user_role: message.sender,
          sender_id: user?.id || null,
        }]);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error saving message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCloseConversation = async () => {
    if (messages.length > 0 && currentChatId) {
      const themes = identifyThemes(messages);
      
      try {
        // First, get the current chat data to check if summary exists
        const { data: chatData, error: chatError } = await supabase
          .from('chat')
          .select('summary')
          .eq('id', currentChatId)
          .single();

        if (chatError) throw chatError;

        let summary = chatData.summary;

        // Only generate summary if it doesn't exist
        if (!summary) {
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke('summarize-chat', {
            body: { messages }
          });

          if (summaryError) throw summaryError;
          summary = summaryData.summary;
        }

        // Update chat with themes and summary (if generated)
        await supabase
          .from('chat')
          .update({ 
            theme: themes.join(', '),
            summary: summary,
            last_updated: new Date().toISOString()
          })
          .eq('id', currentChatId);
      } catch (error: any) {
        toast({
          title: "Error saving chat",
          description: error.message,
          variant: "destructive"
        });
      }
    }
    navigate('/entries');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { userMessage }
      });

      if (error) throw error;
      return data.response;
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error getting AI response",
        description: error.message,
        variant: "destructive"
      });
      return "I apologize, but I'm having trouble responding right now. Could you please try again?";
    }
  };

  const simulateAIResponse = async (userMessage: string, chatId: number) => {
    setIsTyping(true);
    
    try {
      const aiResponse = await getAIResponse(userMessage);
      
      const aiMessage = {
        id: Date.now().toString(),
        text: aiResponse,
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      await saveMessage(aiMessage, chatId);
    } catch (error) {
      console.error('Error in AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const chatId = currentChatId || await createNewChat();
    if (!chatId) return;

    setCurrentChatId(chatId);

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    await saveMessage(newMessage, chatId);
    await simulateAIResponse(input, chatId);
  };

  useEffect(() => {
    if (initialMessage && user) {
      const setupInitialChat = async () => {
        const chatId = await createNewChat();
        if (!chatId) return;

        setCurrentChatId(chatId);
        const firstMessage = {
          id: Date.now().toString(),
          text: initialMessage,
          sender: 'user' as const,
          timestamp: new Date()
        };
        
        setMessages([firstMessage]);
        await saveMessage(firstMessage, chatId);
        await simulateAIResponse(initialMessage, chatId);
      };

      setupInitialChat();
    }
  }, [initialMessage, user]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      // If there's a message in progress, save it
      if (location.state?.initialMessage) {
        sessionStorage.setItem('pendingMessage', location.state.initialMessage);
      }
      navigate('/auth', {
        state: { tab: 'signin', redirectTo: '/chat' }
      });
    }
  }, [user, navigate, location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) {
    return null;
  }

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(selection.toString());
      setSelectionPosition({
        x: rect.x + rect.width / 2,
        y: rect.y - 10
      });
      setShowHighlightTooltip(true);
    } else {
      setShowHighlightTooltip(false);
    }
  };

  // Handle highlight action
  const handleHighlight = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = 'bg-[#F5D76E]';
      range.surroundContents(span);
      setShowHighlightTooltip(false);
    }
  };

  // Handle remove highlight
  const handleRemoveHighlight = (element: HTMLElement) => {
    const parent = element.parentNode;
    if (parent) {
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }
    setShowHighlightTooltip(false);
  };

  return (
    <div 
      className="min-h-screen bg-soft-ivory flex flex-col"
      onMouseUp={handleTextSelection}
    >
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto pt-24 pb-32 px-4 sm:px-6 relative">
          <Link 
            to="/"
            className="absolute left-6 top-8 text-2xl font-bold text-deep-charcoal hover:text-dusty-rose transition-colors"
          >
            Gentlee
          </Link>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute right-16 top-8 p-2 text-deep-charcoal/60 hover:text-dusty-rose transition-colors"
          >
            {isMuted ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </button>

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
            {messages.map((message, index) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isFirstMessage={index === 0 && message.sender === 'ai'}
              />
            ))}
            {isTyping && <ChatTypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {showHighlightTooltip && (
            <div
              className="fixed bg-white shadow-lg rounded-lg px-4 py-2 transform -translate-x-1/2 z-50"
              style={{
                left: selectionPosition.x,
                top: selectionPosition.y
              }}
            >
              <button
                onClick={handleHighlight}
                className="text-sm text-deep-charcoal hover:text-dusty-rose"
              >
                Highlight
              </button>
            </div>
          )}
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
      
      {/* Audio element for background music */}
      <audio
        src="/path-to-your-music.mp3"
        autoPlay
        loop
        muted={isMuted}
      />
    </div>
  );
};

export default Chat;
