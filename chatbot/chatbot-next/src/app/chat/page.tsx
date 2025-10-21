"use client";
import React, { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return; // Evita enviar mensajes vacíos

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput(""); // Limpia el input después de enviar
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Chatbot</h1>

      <div className="flex-1 overflow-y-auto border p-2 rounded">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.role === "user" ? "Tú" : "Bot"}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Escribe un mensaje..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
