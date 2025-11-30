// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import TaskList from './components/TaskList';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks'>('chat');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll mejorado - se ejecuta cuando hay nuevos mensajes o cambia el loading
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    };

    // Scroll inmediato cuando hay nuevos mensajes
    scrollToBottom();

    // Scroll adicional cuando termina de cargar (para respuestas largas)
    if (!isLoading) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading]);

  const handleTaskUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const validateMessage = (content: string): string | null => {
    const trimmed = content.trim();
    
    if (trimmed.length === 0) {
      return 'El mensaje no puede estar vacío';
    }
    
    if (trimmed.length > 1000) {
      return 'El mensaje es demasiado largo (máximo 1000 caracteres)';
    }
    
    const dangerousPatterns = /[<>]|javascript:|on\w+=/gi;
    if (dangerousPatterns.test(trimmed)) {
      return 'El mensaje contiene caracteres no permitidos';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

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
        throw new Error(`Error: ${response.status}`);
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
              // Ignorar errores de parsing
            }
          }
        }
      }

      // Actualizar la lista de tareas después de la conversación
      handleTaskUpdate();

    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = 'Lo siento, ocurrió un error. Por favor intenta de nuevo.';
      
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          errorMessage = 'Límite de uso excedido. Por favor espera un momento.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Error de autenticación. Contacta al administrador.';
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

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Gestor de Tareas Inteligente</h1>
          <p className="text-gray-600">Gestiona tus tareas conversando con IA</p>
        </div>
      </div>

      <div className="flex-1 flex max-w-6xl mx-auto w-full p-4 gap-6">
        {/* Panel izquierdo - Chat */}
        <div className={`flex-1 flex flex-col ${activeTab === 'chat' ? 'block' : 'hidden md:flex'}`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleTaskUpdate}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Actualizar
                  </button>
                  {messages.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Área de mensajes con altura controlada */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4"
              style={{ 
                maxHeight: '400px',
                minHeight: '200px'
              }}
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <div className="text-4xl mb-2">🤖</div>
                  <p className="text-lg mb-1">¡Hola! Soy tu asistente de tareas</p>
                  <p className="text-sm mb-2">Puedo ayudarte a:</p>
                  <ul className="text-xs text-left max-w-md mx-auto space-y-1">
                    <li>• Crear nuevas tareas</li>
                    <li>• Mostrar tus tareas pendientes</li>
                    <li>• Marcar tareas como completadas</li>
                    <li>• Eliminar tareas</li>
                    <li>• Dar estadísticas de productividad</li>
                  </ul>
                  <p className="text-xs mt-2">Ejemplo: "Crea una tarea para estudiar JavaScript"</p>
                </div>
              ) : (
                messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`mb-3 p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-50 border border-blue-200 ml-8' 
                        : 'bg-white border border-gray-200 mr-8'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-700 mb-1">
                      {message.role === 'user' ? 'Tú' : 'Asistente'}:
                    </div>
                    <div className="text-gray-800 whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex items-center space-x-2 text-gray-500 italic text-sm">
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

            {/* Área del input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Escribe tu mensaje... (ej: 'Crea una tarea para...')"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isLoading}
                  maxLength={1000}
                />
                <button 
                  type="submit" 
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? '...' : 'Enviar'}
                </button>
              </form>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {input.length}/1000 caracteres
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - TaskList Component */}
        <div className={`flex-1 flex flex-col ${activeTab === 'tasks' ? 'block' : 'hidden md:flex'}`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Lista de Tareas</h2>
                <span className="text-sm text-gray-600">
                  Gestión completa de tareas
                </span>
              </div>
            </div>

            {/* Usar el componente TaskList aquí */}
            <div className="flex-1 overflow-y-auto">
              <TaskList 
                refreshTrigger={refreshTrigger}
                onTaskUpdate={handleTaskUpdate}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs para móvil */}
      <div className="md:hidden bg-white border-t border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'chat' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'tasks' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500'
            }`}
          >
            Tareas
          </button>
        </div>
      </div>
    </div>
  );
}