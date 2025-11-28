'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Clave para localStorage
const CHAT_STORAGE_KEY = 'chatbot-messages';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Cargar mensajes desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
          console.log('Mensajes cargados desde localStorage:', parsedMessages.length);
        }
      }
    } catch (error) {
      console.error('Error cargando mensajes desde localStorage:', error);
      // Si hay error, limpiar localStorage corrupto
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, []);

  // 2. Guardar mensajes en localStorage cuando cambien
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        console.log('Mensajes guardados en localStorage:', messages.length);
      } else {
        // Si no hay mensajes, limpiar localStorage
        localStorage.removeItem(CHAT_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error guardando mensajes en localStorage:', error);
    }
  }, [messages]);

  // 3. Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Función de validación de mensajes
  const validateMessage = (content: string): string | null => {
    const trimmed = content.trim();
    
    if (trimmed.length === 0) {
      return 'El mensaje no puede estar vacío';
    }
    
    if (trimmed.length > 1000) {
      return 'El mensaje es demasiado largo (máximo 1000 caracteres)';
    }
    
    // Validar caracteres peligrosos
    const dangerousPatterns = /[<>]|javascript:|on\w+=/gi;
    if (dangerousPatterns.test(trimmed)) {
      return 'El mensaje contiene caracteres no permitidos';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    // Validar el mensaje antes de enviar
    const validationError = validateMessage(input);
    if (validationError) {
      alert(validationError);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content || '';
              
              if (content) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: msg.content + content }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignorar errores de parsing en chunks incompletos
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = 'Lo siento, ocurrió un error. Por favor intenta de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          errorMessage = 'Límite de uso excedido. Por favor espera un momento.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Error de autenticación. Contacta al administrador.';
        } else if (error.message.includes('Validation error')) {
          errorMessage = 'Error en el formato del mensaje. Por favor intenta con otro texto.';
        } else if (error.message.includes('Too many messages')) {
          errorMessage = 'Demasiados mensajes en la conversación. Por favor inicia una nueva conversación.';
        }
      }
      
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: errorMessage,
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Función para limpiar la conversación (y localStorage)
  const clearChat = () => {
    setMessages([]);
    setInput('');
    localStorage.removeItem(CHAT_STORAGE_KEY);
    console.log('Chat limpiado y localStorage eliminado');
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chatbot</h1>
        <div className="flex gap-2">
          {/* Indicador de mensajes guardados */}
          {messages.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {messages.length} mensajes guardados
            </span>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              disabled={isLoading}
            >
              Limpiar Chat
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Inicia una conversación...
            <br />
            <span className="text-sm">(Los mensajes se guardarán automáticamente)</span>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`mb-4 p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-100 border border-blue-200 ml-8' 
                  : 'bg-white border border-gray-200 mr-8'
              }`}
            >
              <div className="font-semibold text-sm text-gray-700 mb-1">
                {message.role === 'user' ? 'Tú' : 'Asistente'}:
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          ))
        )}
        
        {/* Indicador de typing mejorado */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500 italic">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span>Escribiendo...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Escribe tu mensaje..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          maxLength={1000}
        />
        <button 
          type="submit" 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? '...' : 'Enviar'}
        </button>
      </form>
      
      {/* Contador de caracteres */}
      <div className="text-xs text-gray-500 mt-1 text-right">
        {input.length}/1000 caracteres
      </div>
    </div>
  );
}