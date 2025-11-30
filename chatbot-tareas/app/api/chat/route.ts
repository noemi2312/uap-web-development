export async function POST(req: Request) {
  try {
    console.log('=== INICIANDO REQUEST ===');
    
    // 1. Validar que sea una request POST
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // 2. Validar contenido tipo JSON
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response('Unsupported Media Type', { status: 415 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return new Response('Invalid JSON', { status: 400 });
    }

    const { messages } = body;

    // 3. Validación básica de estructura
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format: expected array', { status: 400 });
    }

    // 4. Validar longitud del array de mensajes
    if (messages.length > 20) {
      return new Response('Too many messages: maximum 20 messages allowed', { status: 400 });
    }

    if (messages.length === 0) {
      return new Response('No messages provided', { status: 400 });
    }

    // 5. Sanitizar y validar cada mensaje
    const sanitizedMessages = messages.map((msg: any, index: number) => {
      // Validar estructura básica del mensaje
      if (!msg || typeof msg !== 'object') {
        throw new Error(`Invalid message at index ${index}: expected object`);
      }

      // Sanitizar y validar el rol
      const role = msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system' 
        ? msg.role 
        : 'user'; // Default seguro

      // Sanitizar el contenido
      let content = String(msg.content || '').trim();
      
      // Validar que el contenido no esté vacío (excepto para system messages)
      if (content.length === 0 && role !== 'system') {
        throw new Error(`Empty content in message at index ${index}`);
      }

      // Limitar longitud del contenido por seguridad
      if (content.length > 4000) {
        console.warn(`Message content truncated at index ${index}`);
        content = content.slice(0, 4000);
      }

      // Sanitizar contenido: eliminar caracteres potencialmente peligrosos
      content = content
        .replace(/[<>]/g, '') // Remover < y > para prevenir XSS
        .replace(/javascript:/gi, '') // Remover javascript: links
        .replace(/on\w+=/gi, ''); // Remover event handlers

      return {
        role,
        content
      };
    });

    console.log('Messages sanitized successfully:', {
      totalMessages: sanitizedMessages.length,
      lastMessage: sanitizedMessages[sanitizedMessages.length - 1]?.content?.substring(0, 50) + '...'
    });

    // 6. Validar API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not configured');
      return new Response('Server configuration error', { status: 500 });
    }

    // 7. Preparar request a OpenRouter
    const model = process.env.OPENROUTER_MODEL || 'google/gemma-7b-it:free';
    
    const openRouterBody = {
      model,
      messages: sanitizedMessages,
      stream: true,
      max_tokens: 1000, // Limitar tokens por seguridad
      temperature: 0.7
    };

    console.log('Sending to OpenRouter:', { model, messageCount: sanitizedMessages.length });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Chatbot App'
      },
      body: JSON.stringify(openRouterBody)
    });

    // 8. Manejar respuesta de OpenRouter
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Mensajes de error más específicos para el cliente
      if (response.status === 401) {
        return new Response('Authentication error with AI service', { status: 500 });
      } else if (response.status === 429) {
        return new Response('AI service rate limit exceeded', { status: 429 });
      } else {
        return new Response(`AI service error: ${response.status}`, { status: 500 });
      }
    }

    // 9. Retornar stream exitoso
    console.log('Request completed successfully');
    return new Response(response.body);

  } catch (error) {
    // 10. Manejo robusto de errores
    console.error('Chat API error:', error);
    
    if (error instanceof Error) {
      // Errores de validación que ya manejamos
      if (error.message.includes('Invalid message') || error.message.includes('Empty content')) {
        return new Response(`Validation error: ${error.message}`, { status: 400 });
      }
    }

    return new Response('Internal Server Error', { status: 500 });
  }
}