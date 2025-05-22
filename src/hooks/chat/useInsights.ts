
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { INSIGHT_BANK } from '@/components/chat/InsightCard';
import { UserInsight } from '@/types/databaseTypes';
import { Message } from '@/types/chat';

export const useInsights = (userId: string | undefined, messageCount: number, messages: Message[] = []) => {
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
        // Choose an insight based on the conversation context
        const insight = selectRelevantInsight(messages);
        
        setSelectedInsight(insight);
        setShouldShowInsight(true);
        
        // Still record that user has seen an insight for tracking purposes
        await recordInsightShown(userId);
      } catch (error) {
        console.error('Error in insight eligibility check:', error);
      }
    };
    
    checkInsightEligibility();
  }, [userId, messageCount, messages]);

  // Select a more relevant insight based on conversation context
  const selectRelevantInsight = (messages: Message[]) => {
    // Default to random selection if there are no messages
    if (messages.length < 2) {
      const randomIndex = Math.floor(Math.random() * INSIGHT_BANK.length);
      return INSIGHT_BANK[randomIndex];
    }
    
    // Get the last few user messages to analyze
    const userMessages = messages
      .filter(m => m.sender === 'user')
      .map(m => m.text.toLowerCase())
      .slice(-3);
    
    // Keywords to match with insights
    const keywordMap = [
      { 
        keywords: ['tired', 'exhausted', 'drained', 'overwhelmed', 'burden'],
        insight: INSIGHT_BANK[5] // "Maybe the tiredness isn't from what you're doing — but from pretending it doesn't hurt."
      },
      {
        keywords: ['blame', 'fault', 'sorry', 'apologize', 'my fault', 'guilt'],
        insight: INSIGHT_BANK[6] // "The way you're blaming yourself sounds like a habit you picked up to stay safe."
      },
      {
        keywords: ['silence', 'quiet', 'can\'t talk', 'don\'t share', 'keep to myself'],
        insight: INSIGHT_BANK[3] // "Sometimes your silence is your way of protecting others from how loud your pain really is."
      },
      {
        keywords: ['loss', 'lost', 'miss', 'gone', 'grief', 'sad'],
        insight: INSIGHT_BANK[2] // "It sounds like you're grieving something others never saw you lose."
      },
      {
        keywords: ['help', 'support', 'others', 'there for', 'carrying', 'responsibility'],
        insight: INSIGHT_BANK[0] // "You speak like someone who carries others, even when you're barely holding yourself."
      },
      {
        keywords: ['unfair', 'deserve', 'should have', 'needed', 'want'],
        insight: INSIGHT_BANK[9] // "You're not asking for much. You're asking for what you should've had all along."
      },
      {
        keywords: ['brave', 'strong', 'courage', 'tough', 'keep going'],
        insight: INSIGHT_BANK[4] // "You've been doing the brave thing for so long, it probably doesn't feel like bravery anymore."
      },
      {
        keywords: ['happened', 'trauma', 'experience', 'event', 'incident'],
        insight: INSIGHT_BANK[8] // "I wonder if your heart is still waiting for someone to say, \"That should never have happened to you.\""
      },
      {
        keywords: ['holding', 'inside', 'kept', 'bottled', 'secret'],
        insight: INSIGHT_BANK[1] // "This isn't just about what happened. It's about how long you've held it in."
      }
    ];
    
    // Check all user messages against keywords
    for (const message of userMessages) {
      for (const { keywords, insight } of keywordMap) {
        if (keywords.some(keyword => message.includes(keyword))) {
          return insight;
        }
      }
    }
    
    // If no matching keywords, select semi-randomly but with a bias toward deeper insights
    const preferredInsights = [0, 2, 8, 4]; // Indices of more profound insights
    const randomIndex = Math.floor(Math.random() * preferredInsights.length);
    return INSIGHT_BANK[preferredInsights[randomIndex]];
  };

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
