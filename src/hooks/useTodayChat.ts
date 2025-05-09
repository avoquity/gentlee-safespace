
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay } from 'date-fns';

interface TodayChat {
  id: number;
}

export const useTodayChat = () => {
  const { user } = useAuth();

  const findTodayChat = async (): Promise<TodayChat | null> => {
    if (!user) return null;
    
    const today = startOfDay(new Date());
    
    // Use maybeSingle() instead of single() to handle cases when no results are found
    const { data: existingChat, error } = await supabase
      .from('chat')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())
      .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) {
      console.error('Error finding today\'s chat:', error);
      return null;
    }

    return existingChat;
  };

  return { findTodayChat };
};
