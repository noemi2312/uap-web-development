export async function POST(req: Request) {
  try {
    // Debug: verificar variables de entorno
    console.log('=== DEBUG OPENROUTER ===');
    console.log('API Key exists:', !!process.env.OPENROUTER_API_KEY);
    console.log('API Key starts with:', process.env.OPENROUTER_API_KEY?.substring(0, 10) + '...');
    console.log('Model:', process.env.OPENROUTER_MODEL);
    console.log('====================');

    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages', { status: 400 });
    }

    // Llamada directa a OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Chatbot App'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return new Response(`OpenRouter API error: ${response.status}`, { status: 500 });
    }

    // Retornar el stream directamente
    return new Response(response.body);
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}