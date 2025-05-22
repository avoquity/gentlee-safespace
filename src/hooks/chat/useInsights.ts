
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { INSIGHT_BANK } from '@/components/chat/InsightCard';
import { UserInsight } from '@/types/databaseTypes';

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
        
        // Use our custom SQL function via RPC
        // First parameter is the function name, second is the return type
        const { data, error } = await supabase
          .rpc('get_user_insight', { user_uuid: userId })
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking insight history:', error);
          return;
        }

        // If no record or last shown more than 14 days ago, show insight
        const insightData = data as UserInsight;
        const shouldShow = !data || new Date(insightData?.last_shown_at) < fourteenDaysAgo;
        
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
      
      // Use our custom SQL function via RPC
      const { error } = await supabase
        .rpc('upsert_user_insight', { 
          user_uuid: userId,
          shown_at: now
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
