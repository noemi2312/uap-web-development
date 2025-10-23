"use client";

import { useState, useRef, useEffect } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático al agregar mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // =============================
      // Simulación de streaming para presentación
      // =============================
      // Esto reemplaza temporalmente la llamada real a la API.
      // Cuando tengas la API funcionando, reemplazá este bloque
      // con fetch("/api/chat", { ... }) al backend.
      const fakeResponse = "¡Hola! Esto es una respuesta simulada del asistente.";
      let displayed = "";
      for (const char of fakeResponse) {
        displayed += char;
        setMessages((prev) => [
          ...prev.filter((m) => m.role !== "assistant" || m.content !== displayed.slice(0, -1)), // reemplaza el mensaje en construcción
          { role: "assistant", content: displayed },
        ]);
        await new Promise((r) => setTimeout(r, 30)); // efecto tipo “streaming”
      }

      // =============================
      // Fin simulación
      // =============================

      // Si tuvieras la API real:
      // const res = await fetch("/api/chat", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ message: input }),
      // });
      // const data = await res.json();
      // setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);

    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error al conectar con el servidor." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-4 text-center">💬 Chatbot</h1>

        {/* Zona de mensajes */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-200 text-gray-800 self-start"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {/* Indicador de typing */}
          {isTyping && (
            <div className="p-3 rounded-lg max-w-[80%] bg-gray-200 text-gray-800 self-start">
              🤖 escribiendo...
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Enviar
          </button>
        </div>
      </div>
    </main>
  );
}
