import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
  }

  return NextResponse.json({
    reply: "Esto es una respuesta de prueba desde el backend ✅",
  });
}
