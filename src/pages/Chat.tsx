import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatDateHeader } from '@/components/chat/ChatDateHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { identifyThemes } from '@/utils/themeUtils';
import { Message, LocationState, Highlight } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';
import { fetchChatHighlights } from '@/utils/highlightUtils';

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
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const { data: chatData } = useQuery({
    queryKey: ['chat', currentChatId],
    queryFn: async () => {
      if (!currentChatId) return null;
      
      const { data, error } = await supabase
        .from('chat')
        .select('*')
        .eq('id', currentChatId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!currentChatId
  });

  const { data: chatMessages } = useQuery({
    queryKey: ['messages', currentChatId],
    queryFn: async () => {
      if (!currentChatId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, user_role, created_at')
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
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.user_role as 'user' | 'ai',
        timestamp: new Date(msg.created_at)
      }));
    },
    enabled: !!currentChatId
  });

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

  useEffect(() => {
    const loadHighlights = async () => {
      if (!currentChatId) return;
      
      try {
        const chatHighlights = await fetchChatHighlights(currentChatId);
        setHighlights(chatHighlights);
      } catch (error: any) {
        toast({
          title: "Error loading highlights",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    if (currentChatId) {
      loadHighlights();
    }
  }, [currentChatId, toast]);

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
        const { data: chatData, error: chatError } = await supabase
          .from('chat')
          .select('summary')
          .eq('id', currentChatId)
          .single();

        if (chatError) throw chatError;

        let summary = chatData.summary;

        if (!summary) {
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke('summarize-chat', {
            body: { messages }
          });

          if (summaryError) throw summaryError;
          summary = summaryData.summary;
        }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const chatId = currentChatId || await createNewChat();
    if (!chatId) return;

    setCurrentChatId(chatId);

    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert([{
        chat_id: chatId,
        content: input,
        user_role: 'user',
        sender_id: user.id,
      }])
      .select()
      .single();

    if (messageError) {
      toast({
        title: "Error saving message",
        description: messageError.message,
        variant: "destructive"
      });
      return;
    }

    const newMessage = {
      id: messageData.id.toString(),
      text: input,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    await simulateAIResponse(input, chatId);
  };

  const simulateAIResponse = async (userMessage: string, chatId: number) => {
    setIsTyping(true);
    
    try {
      const aiResponse = await getAIResponse(userMessage);
      
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          content: aiResponse,
          user_role: 'ai',
          sender_id: null,
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      const aiMessage = {
        id: messageData.id.toString(),
        text: aiResponse,
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error in AI response:', error);
      toast({
        title: "Error saving AI response",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (initialMessage && user) {
      const setupInitialChat = async () => {
        const chatId = await createNewChat();
        if (!chatId) return;

        setCurrentChatId(chatId);

        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .insert([{
            chat_id: chatId,
            content: initialMessage,
            user_role: 'user',
            sender_id: user.id,
          }])
          .select()
          .single();

        if (messageError) {
          toast({
            title: "Error saving message",
            description: messageError.message,
            variant: "destructive"
          });
          return;
        }

        const firstMessage = {
          id: messageData.id.toString(),
          text: initialMessage,
          sender: 'user' as const,
          timestamp: new Date()
        };
        
        setMessages([firstMessage]);
        await simulateAIResponse(initialMessage, chatId);
      };

      setupInitialChat();
    }
  }, [initialMessage, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-soft-ivory flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto pt-24 pb-32 px-4 sm:px-6 relative">
          <ChatHeader 
            isMuted={isMuted}
            onMuteToggle={() => {
              setIsMuted(!isMuted);
              if (!isMuted) {
                const audio = document.querySelector('audio');
                if (audio) {
                  audio.muted = true;
                }
              } else {
                const audio = document.querySelector('audio');
                if (audio) {
                  audio.muted = false;
                }
              }
            }}
            onClose={handleCloseConversation}
          />

          <ChatMessages 
            messages={messages}
            highlights={highlights}
            isTyping={isTyping}
            onHighlightChange={(newHighlight) => {
              setHighlights(prev => [...prev, newHighlight]);
            }}
            onHighlightRemove={(highlightId) => {
              setHighlights(prev => prev.filter(h => h.id !== highlightId));
            }}
            messagesEndRef={messagesEndRef}
          />
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
