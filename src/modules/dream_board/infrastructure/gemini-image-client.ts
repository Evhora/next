import { IntegrationError } from "@/shared/errors";

import type { DreamBoardImageClient } from "../application/generate-dream-board";
import { DreamBoard_DreamBoardStyle } from "../domain/dream-board";

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
 * Style directives are server-owned. Users pick an enum; the text lives here
 * so nothing the caller sends can reshape the prompt. Short phrases — Nano
 * Banana weighs them heavily and verbose copy dilutes intent.
 */
const STYLE_DIRECTIVES: Record<DreamBoard_DreamBoardStyle, string> = {
  [DreamBoard_DreamBoardStyle.UNSPECIFIED]: "photorealistic",
  [DreamBoard_DreamBoardStyle.PHOTOREAL]:
    "photorealistic, natural lighting, cinematic depth of field",
  [DreamBoard_DreamBoardStyle.PAINTERLY]:
    "oil painting, visible brush strokes, warm palette",
  [DreamBoard_DreamBoardStyle.SCRAPBOOK]:
    "scrapbook collage, paper textures, handwritten accents, pastel tones",
  [DreamBoard_DreamBoardStyle.CINEMATIC]:
    "cinematic, dramatic rim lighting, volumetric atmosphere, film grain",
  [DreamBoard_DreamBoardStyle.WATERCOLOR]:
    "watercolor painting, soft edges, pastel washes",
};

/**
 * Build the prompt from server-owned data only. Dream titles come from the
 * user's own DB rows (already scoped by user_id + RLS); the style directive
 * is a closed enum. No free-text ever flows through.
 *
 * When `withPhoto` is false the prompt omits identity-preservation language
 * and simply asks for "a person" — used when the user has no reference photo
 * or chose to skip it for this board.
 */
const buildPrompt = (
  dreamTitles: string[],
  style: DreamBoard_DreamBoardStyle,
  withPhoto: boolean,
): string => {
  const bullets = dreamTitles.map((t) => `- ${t}`).join("\n");
  const subject = withPhoto
    ? "Fuse the person from the reference photo into an inspirational scene"
    : "Show a person (any ethnicity, age, and gender) in an inspirational scene";
  const identity = withPhoto
    ? "Preserve the person's facial identity carefully."
    : "";
  return [
    `Create a single unified vision-board image in ${STYLE_DIRECTIVES[style]} style.`,
    `${subject} that represents these life goals:`,
    bullets,
    `${identity} One cohesive composition — not a collage.`.trim(),
    `No text, no logos, no watermarks, no captions. Aspirational, evocative, suitable for a dream board.`,
  ].join("\n\n");
};

/**
 * Nano Banana adapter. Implements the `DreamBoardImageClient` port so the
 * application layer depends on an interface — swapping providers (or mocking
 * in tests) only touches this file.
 *
 * One HTTP call per board. Photo + prompt go as a single multimodal request;
 * we extract the first inline-image part from the response.
 */
export class GeminiImageClient implements DreamBoardImageClient {
  async generate(input: {
    dreamTitles: string[];
    style: DreamBoard_DreamBoardStyle;
    photo?: { bytes: Uint8Array; mimeType: string };
  }): Promise<Uint8Array> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new IntegrationError("AI image generation is not configured.");
    }

    const prompt = buildPrompt(input.dreamTitles, input.style, !!input.photo);

    // Photo part comes first when present — Gemini weights earlier parts
    // more heavily for image conditioning.
    const photoParts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [];
    if (input.photo) {
      photoParts.push({
        inlineData: {
          mimeType: input.photo.mimeType,
          data: Buffer.from(input.photo.bytes).toString("base64"),
        },
      });
    }
    photoParts.push({ text: prompt });

    let res: Response;
    try {
      res = await fetch(`${GEMINI_BASE}/${IMAGE_MODEL}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ photoParts }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      });
    } catch (error) {
      throw new IntegrationError(
        error instanceof Error
          ? error.message
          : "Network error calling Gemini.",
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
      const payload = part.inlineData ?? part.inline_data;
      const b64 = part.inlineData?.data ?? part.inline_data?.data ?? undefined;
      if (payload && b64) {
        return new Uint8Array(Buffer.from(b64, "base64"));
      }
    }

    throw new IntegrationError("Gemini response contained no image data.");
  }
}
