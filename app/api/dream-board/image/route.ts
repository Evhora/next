import { NextResponse } from "next/server";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const IMAGE_MODEL = "gemini-2.5-flash-image"; // Nano Banana: fast, 1:1 at 1024px

type GeminiPart = {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
  inline_data?: { mime_type?: string; data?: string };
};

/**
 * Generates an image for a dream using Google Gemini (Nano Banana) image generation.
 * Requires GEMINI_API_KEY in env (get key at https://aistudio.google.com/apikey).
 */
export async function POST(request: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "AI image generation is not configured" },
      { status: 503 },
    );
  }

  let body: { prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const fullPrompt = `Inspirational, aspirational image for a vision board. Motivating and beautiful representation of: ${prompt}. No text in the image. High quality, evocative, suitable for a dream board.`;

  try {
    const res = await fetch(`${GEMINI_BASE}/${IMAGE_MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini image generation error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: GeminiPart[] };
      }>;
      error?: { message?: string };
    };

    if (data.error?.message) {
      console.error("Gemini API error:", data.error.message);
      return NextResponse.json({ error: data.error.message }, { status: 502 });
    }

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const blob = part.inlineData ?? part.inline_data;
      if (!blob) continue;
      const rawData = blob.data;
      const mime =
        ("mimeType" in blob ? blob.mimeType : undefined) ??
        ("mime_type" in blob ? blob.mime_type : undefined) ??
        "image/png";
      if (rawData) {
        const dataUrl = `data:${mime};base64,${rawData}`;
        return NextResponse.json({ url: dataUrl });
      }
    }

    return NextResponse.json(
      { error: "No image in response" },
      { status: 502 },
    );
  } catch (error) {
    console.error("Dream board image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 },
    );
  }
}
