
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const useMessageDatabase = (userId: string | undefined) => {
  const { toast } = useToast();

  // Save a user message to the database
  const saveUserMessage = async (content: string, chatId: number): Promise<Message | null> => {
    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          content: content,
          user_role: 'user',
          sender_id: userId,
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      return {
        id: messageData.id.toString(),
        text: content,
        sender: 'user' as const,
        timestamp: new Date()
      };
    } catch (error: any) {
      toast({
        title: "Error saving message",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  // Save an AI message to the database
  const saveAIMessage = async (content: string, chatId: number): Promise<Message | null> => {
    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          content: content,
          user_role: 'ai',
          sender_id: null,
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      return {
        id: messageData.id.toString(),
        text: content,
        sender: 'ai' as const,
        timestamp: new Date()
      };
    } catch (error: any) {
      toast({
        title: "Error saving AI response",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    saveUserMessage,
    saveAIMessage
  };
};
