
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const useDataFetching = (
  currentChatId: number | null,
  setMessages: (messages: Message[]) => void
) => {
  const { toast } = useToast();

  // Query for chat data
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

  // Query for chat messages
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

  // Update messages when chat messages data changes
  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages, setMessages]);

  return {
    chatData
  };
};
