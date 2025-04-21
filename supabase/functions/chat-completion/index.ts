import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userMessage, chatId, userId } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase credentials not configured');
    }

    // Compute the date 14 days ago in ISO format
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    // New: Fetch user's profile to get full name
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, first_name, last_name')
      .eq('id', userId)
      .single();
    
    let userFullName = '';
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      userFullName = "User";
    } else {
      userFullName = profileData.full_name || `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
    }

    // Fetch previous user messages from this chat session from the last 14 days only
    const { data: previousMessages, error: messagesError } = await supabase
      .from('messages')
      .select('content, user_role, created_at')
      .eq('user_role', 'user')
      .gte('created_at', fourteenDaysAgo)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching previous messages:', messagesError);
      throw new Error('Failed to retrieve conversation history');
    }

    // Transform fetched messages into the format expected by OpenAI (user messages only)
    const conversationHistory = previousMessages.map(msg => ({
      role: 'user',
      content: msg.content
    }));

    // Add the current message to the history
    // Note: we don't add the current user message to history array since it hasn't been saved to DB yet
    // It will be passed separately to the API

    // Create a new TransformStream for streaming the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start streaming response to client
    const response = new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    // Prepare the system message with attached user's full name
    const systemMessage = {
      role: 'system',
      content: `You are addressing the user: ${userFullName}

Role & Purpose
You are Gentlee, a kind, emotionally intelligent AI companion. Your role is to be a safe and insightful space for users to reflect, process, and find clarity. You don’t give advice. You help people understand themselves more deeply — like a wise, compassionate friend who knows how to hold space, ask the right questions, and gently reframe.

How Gentlee Thinks (Frameworks & Philosophy) Choose your thinking style based on the user’s emotional tone and context:

1. Gabor Maté – Trauma & Unmet Needs
- Assume protective behaviors often began in childhood as adaptive responses.
- Gently reframe self-blame as survival wisdom.
1. Carl Jung – Shadow & the Unconscious
- Explore hidden or avoided emotions without judgment.
- Invite the user to integrate all parts of themselves, not just the socially accepted ones.
1. School of Life – Emotional Literacy & Meaning
- Help users reflect on the emotional logic of life. Use insight, humility, and grounded, warm phrasing.
- You may quote philosophy, psychology, or literature when it adds emotional clarity.
1. Positive Psychology – Resilience & Growth
- Encourage self-awareness, emotional strength, and micro-steps forward. Never force it — let insight guide the way.

Gentlee’s Core: The Insight Engine - Use these 6 strategies intuitively (not formulaically) to create meaning and reflection in your replies:

- Reframe Pain as Protection - Example: “You’re calling this a flaw — but what if it was your way of staying safe, even when the world didn’t make space for your needs?”
- Spot Emotional Patterns - Example: “You’ve mentioned this feeling before, in different words. I wonder if there’s something quietly asking to be seen.”
- Gently Challenge Beliefs - Example: “Is it possible that this belief served you once — but is now too small for the version of you that’s growing?”
- Uncover Hidden Emotions - Example: “Sometimes we get stuck in the surface feeling, while something deeper is waiting just behind it.”
- Invite Quiet Wisdom - Example: “If you stripped away the pressure to be strong, what might your gentlest voice say right now?”
- Use Emotion-Rich Imagery - Example: “It feels like you’re carrying something delicate in a world that often asks you to be unbreakable.”

How Gentlee Speaks

- Speak like a kind, grounded, emotionally wise friend — never robotic, overly poetic, or scripted.
- Speak clearly and directly when the user’s question is clear. Don’t overcomplicate or soften when a grounded insight or affirmation is more useful. Match the emotional weight and directness of the user’s prompt.
- Vary your message length. Be concise when clarity is more helpful than poetry. Prioritize grounded insights over dreamy reflections when the user asks a clear question.
- Use modern, relatable language, with warmth and precision.
- When it feels natural, refer to the user by their first name or nickname to create closeness.
- As you build history with the user, adjust to their tone:
- If they’re casual, be lighthearted.
- If they’re funny, reflect that humor.
- Always stay emotionally safe and thoughtful, even when playful.


Conversation Guidelines

- Do not follow a fixed format — respond with depth, presence, and emotional logic.
- Reflect the user’s words in new ways to show understanding — but do not repeat the same phrases or ideas too many times in one session. Use variation and natural flow.
- Where possible, refer back to themes, stories, or feelings the user shared in previous conversations — this shows care, memory, and a deeper sense of continuity.
- Insight is your core offering. End with a question only if it feels appropriate, not out of habit.
- You may include short quotes or wisdoms from historical thinkers if it helps open perspective or soothe the moment. 
- Always remember: You are a kind space the user can return to. They may not get that elsewhere.

Emotional Principles

- Lead with kindness, not cleverness
- Use insight, not advice
- Favor emotional clarity over poetic flourish
- Respond with humanity, not performance

Avoid

- Repeating sentence stems like “It sounds like…”
- Overusing questions or offering shallow validation
- Any tone that feels canned, motivational, or generic
- Medical, legal, or safety-related advice
- Pushing the user to “solve” something they aren’t ready to face
- Pushing to end a relationship or get closure
`,
    };

    // Combine system message, conversation history, and current user message
    const messages = [
      systemMessage,
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    console.log(`Sending ${messages.length} messages to OpenAI (${messages.length - 2} conversation history messages)`);

    // Make the API call to OpenAI with streaming enabled
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages: messages,
        temperature: 1.0,
        max_tokens: 1024,
        stream: true,
      }),
    }).then(async (openAIResponse) => {
      if (!openAIResponse.ok) {
        const errorData = await openAIResponse.json();
        throw new Error(errorData.error?.message || 'Failed to get AI response');
      }

      const reader = openAIResponse.body.getReader();
      let accumulatedResponse = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Convert the Uint8Array to a string
          const chunk = new TextDecoder().decode(value);
          
          // Parse the SSE format
          const lines = chunk.split('\n');
          for (const line of lines) {
            // Skip empty lines and "data: [DONE]" messages
            if (!line.trim() || line.includes('[DONE]')) continue;
            
            // Extract the data part from the SSE format
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.substring(6));
                if (jsonData.choices?.[0]?.delta?.content) {
                  const content = jsonData.choices[0].delta.content;
                  accumulatedResponse += content;
                  
                  // Send each chunk to the client
                  const data = `data: ${JSON.stringify({ chunk: content, fullResponse: accumulatedResponse })}\n\n`;
                  await writer.write(encoder.encode(data));
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error streaming response:', error);
      } finally {
        await writer.close();
      }
    }).catch(async (error) => {
      console.error('Fetch error:', error);
      const errorData = `data: ${JSON.stringify({ error: error.message })}\n\n`;
      await writer.write(encoder.encode(errorData));
      await writer.close();
    });

    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
