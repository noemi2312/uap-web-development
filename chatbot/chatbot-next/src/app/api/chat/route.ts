import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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
        messages, // enviamos todo el historial
      }),
    });

    const rawData = await response.json();
    console.log("Respuesta cruda de OpenRouter:", rawData);

    const content = rawData?.choices?.[0]?.message?.content || "No se pudo obtener una respuesta.";
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Error en backend:", error);
    return NextResponse.json({ content: "Error procesando la solicitud." }, { status: 500 });
  }
}
