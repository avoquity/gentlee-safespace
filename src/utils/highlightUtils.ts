
import { supabase } from '@/integrations/supabase/client';
import { Highlight } from '@/types/chat';

export const fetchMessageHighlights = async (messageId: number | string) => {
  const parsedMessageId = typeof messageId === 'string' ? parseInt(messageId) : messageId;
  
  if (isNaN(parsedMessageId)) {
    throw new Error('Invalid message ID');
  }

  const { data, error } = await supabase
    .from('highlights')
    .select('*')
    .eq('message_id', parsedMessageId)
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
