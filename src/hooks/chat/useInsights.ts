
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
      if (!userId || messageCount < 2) {
        // Only show after the 2nd message
        return;
      }

      try {
        // Always show insight regardless of when it was last shown
        // Pick a random insight
        const randomIndex = Math.floor(Math.random() * INSIGHT_BANK.length);
        const insight = INSIGHT_BANK[randomIndex];
        
        setSelectedInsight(insight);
        setShouldShowInsight(true);
        
        // Still record that user has seen an insight for tracking purposes
        await recordInsightShown(userId);
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
