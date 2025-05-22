
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { INSIGHT_BANK } from '@/components/chat/InsightCard';

type InsightRecord = {
  user_id: string;
  last_shown_at: Date;
};

export const useInsights = (userId: string | undefined, messageCount: number) => {
  const [shouldShowInsight, setShouldShowInsight] = useState<boolean>(false);
  const [selectedInsight, setSelectedInsight] = useState<string>('');

  // Check if we should show an insight based on criteria
  useEffect(() => {
    const checkInsightEligibility = async () => {
      if (!userId || messageCount !== 2) {
        // Only show after the 2nd message (when messageCount becomes 2)
        return;
      }

      try {
        // Check if user has seen an insight in the last 14 days
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        
        const { data, error } = await supabase
          .from('user_insights')
          .select('last_shown_at')
          .eq('user_id', userId)
          .single();
        
        if (error && error.code !== 'PGSQL_ERROR_NO_DATA_FOUND') {
          console.error('Error checking insight history:', error);
          return;
        }

        // If no record or last shown more than 14 days ago, show insight
        const shouldShow = !data || new Date(data.last_shown_at) < fourteenDaysAgo;
        
        if (shouldShow) {
          // Pick a random insight
          const randomIndex = Math.floor(Math.random() * INSIGHT_BANK.length);
          const insight = INSIGHT_BANK[randomIndex];
          
          setSelectedInsight(insight);
          setShouldShowInsight(true);
          
          // Record that user has seen an insight
          await recordInsightShown(userId);
        }
      } catch (error) {
        console.error('Error in insight eligibility check:', error);
      }
    };
    
    checkInsightEligibility();
  }, [userId, messageCount]);

  // Record that an insight was shown to the user
  const recordInsightShown = async (userId: string) => {
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('user_insights')
        .upsert({ 
          user_id: userId, 
          last_shown_at: now 
        }, { 
          onConflict: 'user_id'  // Update record if user_id already exists
        });
      
      if (error) {
        console.error('Error recording insight view:', error);
      }
    } catch (error) {
      console.error('Error in recordInsightShown:', error);
    }
  };

  return {
    shouldShowInsight,
    selectedInsight,
    setShouldShowInsight
  };
};
