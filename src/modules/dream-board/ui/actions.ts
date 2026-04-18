"use server";

import { buildCtx } from "@/shared/context";
import { ValidationError } from "@/shared/errors";
import { failFromError, ok, type ActionResult } from "@/shared/result";

import { generateDreamImage } from "../infrastructure/gemini-image-client";

/**
 * Server action: generate an inspirational image for a dream title. Auth is
 * checked via `buildCtx` so the public Gemini key isn't exposed and only
 * signed-in users can drive the integration.
 */
export async function generateDreamImageAction(
  prompt: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    await buildCtx();
    const trimmed = prompt.trim();
    if (!trimmed) throw new ValidationError("Prompt is required.");
    const url = await generateDreamImage(trimmed);
    return ok({ url });
  } catch (error) {
    return failFromError(error);
  }
}
