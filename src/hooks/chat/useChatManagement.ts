
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay } from 'date-fns';
import { identifyThemes } from '@/utils/themeUtils';
import { Message } from '@/types/chat';

export const useChatManagement = (userId: string | undefined) => {
  const { toast } = useToast();
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  
  // Function to find today's chat
  const findTodaysChat = async () => {
    if (!userId) return null;
    
    try {
      const today = startOfDay(new Date());
      
      const { data: existingChats, error } = await supabase
        .from('chat')
        .select('id, created_at')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())
        .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error checking for existing chat:', error);
        return null;
      }
      
      if (existingChats && existingChats.length > 0) {
        return existingChats[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding today\'s chat:', error);
      return null;
    }
  };

  // Create a new chat
  const createNewChat = async () => {
    try {
      const { data, error } = await supabase
        .from('chat')
        .insert([{ 
          last_updated: new Date().toISOString(),
          theme: null,
          summary: null,
          user_id: userId
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

  // Save message to database
  const saveMessage = async (message: Message, chatId: number) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          content: message.text,
          user_role: message.sender,
          sender_id: userId || null,
        }]);

      if (error) throw error;
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error saving message",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  // Handle closing the conversation
  const handleCloseConversation = async (messages: Message[], currentChatId: number | null) => {
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

        // Update theme and summary before navigating away
        await supabase
          .from('chat')
          .update({ 
            theme: themes.join(', '),
            summary: summary,
            last_updated: new Date().toISOString()
          })
          .eq('id', currentChatId);
          
        return true;
      } catch (error: any) {
        toast({
          title: "Error saving chat",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  // Get today's formatted date
  const getTodayFormattedDate = () => {
    return format(new Date(), 'd MMMM yyyy');
  };

  return {
    currentChatId,
    setCurrentChatId,
    findTodaysChat,
    createNewChat,
    saveMessage,
    handleCloseConversation,
    getTodayFormattedDate
  };
};
