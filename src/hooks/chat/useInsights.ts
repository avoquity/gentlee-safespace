
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserInsight } from '@/types/databaseTypes';
import { Message } from '@/types/chat';
import { addDays, parseISO, isAfter } from 'date-fns';

// Enhanced insight bank with more emotionally validating insights for first-time users
export const FIRST_TIME_INSIGHTS = [
  "Just speaking these words shows courage most people never find.",
  "What you're carrying isn't yours alone to hold forever.",
  "Your heart is asking for exactly what it deserves.",
  "This feeling you're describing? It's not a flaw—it's information.",
  "You're not broken. You're human in a world that forgot how to hold space for that.",
  "The fact that you're here, sharing this, is already healing in motion.",
  "Your pain has been trying to teach you something important about yourself.",
  "What if this difficult feeling is actually your wisdom trying to surface?",
  "You speak like someone who's been strong for others while forgetting your own needs.",
  "The gentleness you show others? You deserve that directed toward yourself too."
];

export const INSIGHT_BANK = [
  "You speak like someone who carries others, even when you're barely holding yourself.",
  "This isn't just about what happened. It's about how long you've held it in.",
  "It sounds like you're grieving something others never saw you lose.",
  "Sometimes your silence is your way of protecting others from how loud your pain really is.",
  "You've been doing the brave thing for so long, it probably doesn't feel like bravery anymore.",
  "Maybe the tiredness isn't from what you're doing — but from pretending it doesn't hurt.",
  "The way you're blaming yourself sounds like a habit you picked up to stay safe.",
  "Your heart is asking for permission to feel what it's always felt.",
  "I wonder if your heart is still waiting for someone to say, \"That should never have happened to you.\"",
  "You're not asking for much. You're asking for what you should've had all along."
];

export const useInsights = (userId: string | undefined, messageCount: number, messages: Message[] = []) => {
  const [shouldShowInsight, setShouldShowInsight] = useState<boolean>(false);
  const [selectedInsight, setSelectedInsight] = useState<string>('');

  // Check if we should show an insight based on criteria
  useEffect(() => {
    const checkInsightEligibility = async () => {
      if (!userId || messages.length === 0) {
        return;
      }

      try {
        // Count number of AI messages
        const aiMessageCount = messages.filter(m => m.sender === 'ai').length;
        
        // For first-time users, show insight after the first AI message
        if (aiMessageCount === 1) {
          // Check if this is a first-time user by looking at their chat history
          const { data: userChats, error: chatsError } = await supabase
            .from('chat')
            .select('id')
            .eq('user_id', userId);

          if (chatsError) {
            console.error('Error checking user chat history:', chatsError);
            return;
          }

          // If user has 1 or fewer chats, they're essentially a first-time user
          const isFirstTimeUser = !userChats || userChats.length <= 1;

          if (isFirstTimeUser) {
            // Show immediate insight for first-time users
            const insight = selectFirstTimeInsight(messages);
            setSelectedInsight(insight);
            setShouldShowInsight(true);
            
            // Record that user has seen an insight
            await recordInsightShown(userId);
            return;
          }
        }

        // Regular insight logic for returning users
        if (aiMessageCount < 1) {
          return;
        }

        // Check when the last insight was shown to this user
        const { data, error } = await supabase
          .from('user_insights')
          .select('last_shown_at')
          .eq('user_id', userId)
          .order('last_shown_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error checking user insights:', error);
          return;
        }

        // Determine if we should show an insight
        let shouldShow = true;

        // If user has seen an insight before, check the 14-day interval
        if (data && data.length > 0) {
          const lastShownDate = parseISO(data[0].last_shown_at);
          const nextEligibleDate = addDays(lastShownDate, 14);
          const now = new Date();
          
          shouldShow = isAfter(now, nextEligibleDate);
        }

        if (shouldShow) {
          const insight = selectRelevantInsight(messages);
          setSelectedInsight(insight);
          setShouldShowInsight(true);
          
          await recordInsightShown(userId);
        }
      } catch (error) {
        console.error('Error in insight eligibility check:', error);
      }
    };
    
    checkInsightEligibility();
  }, [userId, messages]);

  // Select a first-time user insight based on emotional tone
  const selectFirstTimeInsight = (messages: Message[]) => {
    if (messages.length === 0) {
      return FIRST_TIME_INSIGHTS[0];
    }
    
    const userMessages = messages
      .filter(m => m.sender === 'user')
      .map(m => m.text.toLowerCase());
    
    // Enhanced keyword matching for emotional validation
    const emotionalKeywords = [
      { 
        keywords: ['feel', 'feeling', 'feels', 'emotional', 'emotion'],
        insight: FIRST_TIME_INSIGHTS[3] // "This feeling you're describing? It's not a flaw—it's information."
      },
      {
        keywords: ['hard', 'difficult', 'tough', 'struggle', 'struggling'],
        insight: FIRST_TIME_INSIGHTS[0] // "Just speaking these words shows courage most people never find."
      },
      {
        keywords: ['alone', 'lonely', 'isolated', 'nobody', 'no one'],
        insight: FIRST_TIME_INSIGHTS[1] // "What you're carrying isn't yours alone to hold forever."
      },
      {
        keywords: ['tired', 'exhausted', 'drained', 'overwhelmed'],
        insight: FIRST_TIME_INSIGHTS[8] // "You speak like someone who's been strong for others while forgetting your own needs."
      },
      {
        keywords: ['anxious', 'anxiety', 'worried', 'stress', 'nervous'],
        insight: FIRST_TIME_INSIGHTS[7] // "What if this difficult feeling is actually your wisdom trying to surface?"
      },
      {
        keywords: ['help', 'support', 'need', 'want'],
        insight: FIRST_TIME_INSIGHTS[2] // "Your heart is asking for exactly what it deserves."
      }
    ];
    
    for (const message of userMessages) {
      for (const { keywords, insight } of emotionalKeywords) {
        if (keywords.some(keyword => message.includes(keyword))) {
          return insight;
        }
      }
    }
    
    // Default to a powerful validating insight
    return FIRST_TIME_INSIGHTS[5]; // "The fact that you're here, sharing this, is already healing in motion."
  };

  // Select a more relevant insight based on conversation context (for returning users)
  const selectRelevantInsight = (messages: Message[]) => {
    if (messages.length === 0) {
      const randomIndex = Math.floor(Math.random() * INSIGHT_BANK.length);
      return INSIGHT_BANK[randomIndex];
    }
    
    const userMessages = messages
      .filter(m => m.sender === 'user')
      .map(m => m.text.toLowerCase())
      .slice(-3);
    
    const keywordMap = [
      { 
        keywords: ['tired', 'exhausted', 'drained', 'overwhelmed', 'burden'],
        insight: INSIGHT_BANK[5]
      },
      {
        keywords: ['blame', 'fault', 'sorry', 'apologize', 'my fault', 'guilt'],
        insight: INSIGHT_BANK[6]
      },
      {
        keywords: ['silence', 'quiet', 'can\'t talk', 'don\'t share', 'keep to myself'],
        insight: INSIGHT_BANK[3]
      },
      {
        keywords: ['loss', 'lost', 'miss', 'gone', 'grief', 'sad'],
        insight: INSIGHT_BANK[2]
      },
      {
        keywords: ['help', 'support', 'others', 'there for', 'carrying', 'responsibility'],
        insight: INSIGHT_BANK[0]
      },
      {
        keywords: ['unfair', 'deserve', 'should have', 'needed', 'want'],
        insight: INSIGHT_BANK[9]
      },
      {
        keywords: ['brave', 'strong', 'courage', 'tough', 'keep going'],
        insight: INSIGHT_BANK[4]
      },
      {
        keywords: ['happened', 'trauma', 'experience', 'event', 'incident'],
        insight: INSIGHT_BANK[8]
      },
      {
        keywords: ['holding', 'inside', 'kept', 'bottled', 'secret'],
        insight: INSIGHT_BANK[1]
      }
    ];
    
    for (const message of userMessages) {
      for (const { keywords, insight } of keywordMap) {
        if (keywords.some(keyword => message.includes(keyword))) {
          return insight;
        }
      }
    }
    
    const preferredInsights = [0, 2, 8, 4];
    const randomIndex = Math.floor(Math.random() * preferredInsights.length);
    return INSIGHT_BANK[preferredInsights[randomIndex]];
  };

  const recordInsightShown = async (userId: string) => {
    try {
      const now = new Date().toISOString();
      
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
