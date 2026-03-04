import { GoogleGenerativeAI } from "@google/generative-ai";
import { LUMIQ_SYSTEM_PROMPT } from "@/lib/system-prompt";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob | null;
    const textInput = formData.get("text") as string | null;
    const mimeType = (formData.get("mimeType") as string) || "audio/webm";

    if (!audioBlob && !textInput) {
      return new Response(JSON.stringify({ error: "No input provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const model = genai.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: LUMIQ_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 32768,
      },
    });

    let contentParts: any[];

    if (audioBlob) {
      const audioBytes = await audioBlob.arrayBuffer();
      const base64Audio = Buffer.from(audioBytes).toString("base64");
      contentParts = [
        { inlineData: { mimeType, data: base64Audio } },
        { text: "The user spoke the above audio. Understand what concept they want explained, then generate the complete interactive HTML experience for it. Output ONLY the HTML, nothing else." },
      ];
    } else {
      contentParts = [
        { text: `The user wants to understand: "${textInput}". Generate the complete interactive HTML experience for this concept. Output ONLY the HTML, nothing else.` },
      ];
    }

    const result = await model.generateContentStream(contentParts);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Generation failed" })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Generate route error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
