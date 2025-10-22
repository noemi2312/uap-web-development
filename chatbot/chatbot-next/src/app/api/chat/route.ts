import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "anthropic/claude-3-haiku",
        messages,
      }),
    });

    const data = await response.json();

    console.log("Respuesta cruda de OpenRouter:", data);

    if (!response.ok) {
      throw new Error(data.error?.message || "Error en OpenRouter");
    }

    // ✅ Extraemos sólo el mensaje de la IA
    const reply = data.choices?.[0]?.message?.content ?? "No se pudo obtener una respuesta.";

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Error en /api/chat:", error);
    return NextResponse.json(
      { reply: "⚠️ Error al procesar la solicitud" }, 
      { status: 500 }
    );
  }
}
