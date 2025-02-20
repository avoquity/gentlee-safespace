
import { supabase } from '@/integrations/supabase/client';
import { Highlight } from '@/types/chat';

export const fetchChatHighlights = async (chatId: number | string) => {
  const parsedChatId = typeof chatId === 'string' ? parseInt(chatId) : chatId;
  
  if (isNaN(parsedChatId)) {
    throw new Error('Invalid chat ID');
  }

  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('id')
    .eq('chat_id', parsedChatId);

  if (messagesError) {
    throw messagesError;
  }

  const messageIds = messages.map(m => m.id);

  if (messageIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('highlights')
    .select('*')
    .in('message_id', messageIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

export const createHighlight = async (messageId: number | string, start: number, end: number, userId: string) => {
  const parsedMessageId = typeof messageId === 'string' ? parseInt(messageId) : messageId;
  
  if (isNaN(parsedMessageId)) {
    throw new Error('Invalid message ID');
  }

  // First verify the message exists
  const { data: messageExists, error: messageError } = await supabase
    .from('messages')
    .select('id')
    .eq('id', parsedMessageId)
    .single();

  if (messageError || !messageExists) {
    throw new Error('Message not found');
  }

  const { data, error } = await supabase
    .from('highlights')
    .insert([{
      message_id: parsedMessageId,
      start_index: start,
      end_index: end,
      user_id: userId
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const removeHighlight = async (highlightId: number) => {
  const { error } = await supabase
    .from('highlights')
    .delete()
    .eq('id', highlightId);

  if (error) {
    throw error;
  }
};
