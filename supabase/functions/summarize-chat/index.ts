
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Verify OpenAI API key is available
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const { messages } = await req.json();
    
    // Validate messages input
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid or empty messages array');
    }

    // Extract only user messages for summarization
    const userMessages = messages
      .filter((msg: any) => msg.sender === 'user')
      .map((msg: any) => msg.text)
      .join('\n');

    if (!userMessages) {
      return new Response(
        JSON.stringify({ summary: "No user messages to summarize" }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling OpenAI API with messages:', userMessages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes conversations into one concise sentence. Focus on the emotional journey and key themes.'
          },
          {
            role: 'user',
            content: `Please summarize these messages into one sentence that captures the essence of the conversation:\n${userMessages}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    const summary = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ summary }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in summarize-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Error in summarize-chat function' 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
