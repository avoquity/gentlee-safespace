
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userMessages, conversationContext } = await req.json();

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate personalized insight using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a wise, gentle AI companion that generates personalized insights for users based on their conversation patterns. 

Based on the user's recent messages, create a meaningful, personalized insight that:
1. Reflects their specific emotional patterns or themes
2. Offers gentle wisdom tailored to their situation
3. Is warm, non-clinical, and encouraging
4. Helps them understand something about themselves
5. Is 1-2 sentences, poetic yet accessible

Avoid generic advice. Make it specifically relevant to their conversations.`
          },
          {
            role: 'user',
            content: `Based on these recent conversations: "${conversationContext}", generate a personalized insight that speaks to this person's unique emotional journey and patterns.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate insight');
    }

    const data = await response.json();
    const insight = data.choices[0]?.message?.content?.trim();

    if (!insight) {
      throw new Error('No insight generated');
    }

    // Extract themes from the conversation (simple keyword extraction)
    const themes = extractThemes(conversationContext);

    return new Response(
      JSON.stringify({
        insight_text: insight,
        generated_from_themes: themes,
        conversation_context: conversationContext.substring(0, 500) // Limit context length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractThemes(text: string): string[] {
  const themeKeywords = {
    'relationships': ['relationship', 'partner', 'love', 'family', 'friend', 'connect'],
    'anxiety': ['anxious', 'worried', 'stress', 'overwhelm', 'fear', 'nervous'],
    'growth': ['learn', 'grow', 'change', 'better', 'improve', 'progress'],
    'self-worth': ['worth', 'value', 'confidence', 'self-esteem', 'doubt'],
    'life-transitions': ['change', 'transition', 'new', 'different', 'moving'],
    'work-life': ['work', 'job', 'career', 'balance', 'burnout'],
    'grief': ['loss', 'grief', 'sad', 'miss', 'gone', 'death'],
    'purpose': ['purpose', 'meaning', 'direction', 'goal', 'future']
  };

  const lowerText = text.toLowerCase();
  const foundThemes: string[] = [];

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      foundThemes.push(theme);
    }
  }

  return foundThemes.slice(0, 3); // Limit to top 3 themes
}
