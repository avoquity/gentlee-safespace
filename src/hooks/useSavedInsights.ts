
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSavedInsights = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const saveInsight = async (
    insightText: string, 
    insightType: 'generic' | 'personalized' = 'generic',
    personalizedInsightId?: string
  ) => {
    if (!user) return false;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('saved_insights')
        .insert([{
          user_id: user.id,
          insight_text: insightText,
          insight_type: insightType,
          personalized_insight_id: personalizedInsightId
        }]);

      if (error) throw error;

      toast({
        title: "Insight saved",
        description: "Added to your wisdom library for future reflection.",
      });

      return true;
    } catch (error) {
      console.error('Error saving insight:', error);
      toast({
        title: "Error saving insight",
        description: "Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const checkIfInsightSaved = async (insightText: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('saved_insights')
        .select('id')
        .eq('user_id', user.id)
        .eq('insight_text', insightText)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if insight is saved:', error);
      return false;
    }
  };

  return {
    saveInsight,
    checkIfInsightSaved,
    isSaving
  };
};
