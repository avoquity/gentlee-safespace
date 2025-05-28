
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const useSharedMessageLogic = (userId: string | undefined) => {
  const { toast } = useToast();

  const insertUserMessage = async (
    content: string, 
    chatId: number
  ): Promise<Message | null> => {
    if (!userId) return null;

    try {
      // Add a small delay to prevent race conditions with rapid successive calls
      await new Promise(resolve => setTimeout(resolve, 50));

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

      if (messageError) {
        throw messageError;
      }

      return {
        id: messageData.id.toString(),
        text: content,
        sender: 'user' as const,
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error('Error inserting user message:', error);
      toast({
        title: "Error saving message",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    insertUserMessage
  };
};
