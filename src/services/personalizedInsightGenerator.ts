
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

interface InsightGenerationData {
  messages: Message[];
  userId: string;
}

export class PersonalizedInsightGenerator {
  static async generatePersonalizedInsight({ messages, userId }: InsightGenerationData) {
    try {
      // Get recent conversation themes from user's messages
      const userMessages = messages
        .filter(msg => msg.sender === 'user')
        .slice(-10) // Last 10 user messages for context
        .map(msg => msg.text);

      if (userMessages.length < 3) {
        return null; // Need minimum conversation depth
      }

      // Call edge function to generate personalized insight
      const { data, error } = await supabase.functions.invoke('generate-personalized-insight', {
        body: {
          userId,
          userMessages,
          conversationContext: userMessages.join(' ')
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error generating personalized insight:', error);
      return null;
    }
  }

  static async savePersonalizedInsight(userId: string, insightData: {
    insight_text: string;
    generated_from_themes?: string[];
    conversation_context?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('personalized_insights')
        .insert([{
          user_id: userId,
          ...insightData
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving personalized insight:', error);
      return null;
    }
  }

  static async getUserPersonalizedInsights(userId: string) {
    try {
      const { data, error } = await supabase
        .from('personalized_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching personalized insights:', error);
      return [];
    }
  }
}
