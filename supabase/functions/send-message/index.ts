import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SendMessageRequest {
  chat_id: string;
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Parse request body
    const { chat_id, content }: SendMessageRequest = await req.json();

    if (!chat_id || !content) {
      throw new Error('Missing chat_id or content');
    }

    // Verify user owns the chat
    const { data: chat, error: chatError } = await supabaseClient
      .from('chats')
      .select('id, user_id')
      .eq('id', chat_id)
      .eq('user_id', user.id)
      .single();

    if (chatError || !chat) {
      throw new Error('Chat not found or access denied');
    }

    // Get recent messages for context (last 10 messages)
    const { data: recentMessages } = await supabaseClient
      .from('messages')
      .select('content, is_bot')
      .eq('chat_id', chat_id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses to user questions.',
      },
    ];

    // Add recent messages for context (in reverse order to maintain chronology)
    if (recentMessages) {
      recentMessages
        .reverse()
        .forEach((msg) => {
          messages.push({
            role: msg.is_bot ? 'assistant' : 'user',
            content: msg.content,
          });
        });
    }

    // Add the current user message
    messages.push({
      role: 'user',
      content: content,
    });

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app-domain.com',
        'X-Title': 'Chatbot Application',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const aiResponse: OpenRouterResponse = await openRouterResponse.json();
    const botMessage = aiResponse.choices?.[0]?.message?.content;

    if (!botMessage) {
      throw new Error('No response from AI');
    }

    // Save bot response to database
    const { error: insertError } = await supabaseClient
      .from('messages')
      .insert({
        chat_id: chat_id,
        user_id: user.id,
        content: botMessage,
        is_bot: true,
      });

    if (insertError) {
      console.error('Error saving bot message:', insertError);
      throw new Error('Failed to save bot response');
    }

    // Update chat's updated_at timestamp
    await supabaseClient
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chat_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message sent successfully',
        response: botMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-message function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Internal server error',
        response: null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});