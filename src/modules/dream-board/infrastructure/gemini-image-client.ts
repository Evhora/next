import { IntegrationError } from "@/shared/errors";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const IMAGE_MODEL = "gemini-2.5-flash-image"; // Nano Banana

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
  inline_data?: { mime_type?: string; data?: string };
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string };
}

/**
 * Thin wrapper around the Gemini "Nano Banana" image-generation endpoint.
 * Lives in `infrastructure/` because it's a third-party integration; the use
 * case calls this and never sees HTTP details.
 *
 * Returns a `data:image/...;base64,...` URL ready to drop into an `<img src>`.
 */
export const generateDreamImage = async (prompt: string): Promise<string> => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new IntegrationError("AI image generation is not configured.");
  }

  const fullPrompt =
    `Inspirational, aspirational image for a vision board. Motivating and ` +
    `beautiful representation of: ${prompt}. No text in the image. High ` +
    `quality, evocative, suitable for a dream board.`;

  let res: Response;
  try {
    res = await fetch(`${GEMINI_BASE}/${IMAGE_MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });
  } catch (error) {
    throw new IntegrationError(
      error instanceof Error ? error.message : "Network error calling Gemini.",
    );
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new IntegrationError(
      `Gemini responded ${res.status}: ${errorText.slice(0, 200)}`,
    );
  }

  const data = (await res.json()) as GeminiResponse;
  if (data.error?.message) {
    throw new IntegrationError(data.error.message);
  }

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const camel = part.inlineData;
    if (camel?.data) {
      const mime = camel.mimeType ?? "image/png";
      return `data:${mime};base64,${camel.data}`;
    }
    const snake = part.inline_data;
    if (snake?.data) {
      const mime = snake.mime_type ?? "image/png";
      return `data:${mime};base64,${snake.data}`;
    }
  }

  throw new IntegrationError("Gemini response contained no image data.");
};
