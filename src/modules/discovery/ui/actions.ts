"use server";

import { revalidatePath } from "next/cache";

import { buildCtx } from "@/shared/context";
import { failFromError, ok, type ActionResult } from "@/shared/result";

import { startSession, type StartSessionResult } from "../application/start-session";
import { answerQuestion, type AnswerQuestionResult } from "../application/answer-question";
import { synthesizeCandidates, type SynthesizeCandidatesResult } from "../application/synthesize-candidates";
import { selectCandidates, type SelectCandidatesResult } from "../application/select-candidates";
import { transcribeVoice } from "../application/transcribe-voice";
import { abandonSession } from "../application/abandon-session";
import {
  getActiveSession,
  type ActiveSessionSummary,
} from "../application/get-active-session";
import type { AnswerQuestionCmd } from "../application/schemas";

export async function startSessionAction(): Promise<ActionResult<StartSessionResult>> {
  try {
    const ctx = await buildCtx();
    const result = await startSession(ctx);
    return ok(result);
  } catch (e) {
    return failFromError(e);
  }
}

export async function answerQuestionAction(
  cmd: AnswerQuestionCmd,
): Promise<ActionResult<AnswerQuestionResult>> {
  try {
    const ctx = await buildCtx();
    const result = await answerQuestion(cmd, ctx);
    return ok(result);
  } catch (e) {
    return failFromError(e);
  }
}

export async function synthesizeAction(
  sessionId: string,
): Promise<ActionResult<SynthesizeCandidatesResult>> {
  try {
    const ctx = await buildCtx();
    const result = await synthesizeCandidates({ sessionId }, ctx);
    return ok(result);
  } catch (e) {
    return failFromError(e);
  }
}

export async function selectCandidatesAction(cmd: {
  sessionId: string;
  candidateIds: string[];
}): Promise<ActionResult<SelectCandidatesResult>> {
  try {
    const ctx = await buildCtx();
    const result = await selectCandidates(cmd, ctx);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/dreams");
    return ok(result);
  } catch (e) {
    return failFromError(e);
  }
}

export async function getActiveSessionAction(): Promise<
  ActiveSessionSummary | null
> {
  try {
    const ctx = await buildCtx();
    return await getActiveSession(ctx);
  } catch {
    return null;
  }
}

export async function startOverAction(): Promise<ActionResult<null>> {
  try {
    const ctx = await buildCtx();
    await abandonSession(ctx);
    revalidatePath("/dashboard/discovery");
    revalidatePath("/dashboard");
    return ok(null);
  } catch (e) {
    return failFromError(e);
  }
}

export async function transcribeVoiceAction(
  formData: FormData,
): Promise<ActionResult<{ text: string; durationMs: number; voiceUrl: string }>> {
  try {
    const ctx = await buildCtx();
    const audioBlob = formData.get("audio") as File;
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await transcribeVoice(buffer, ctx.userId, ctx);
    return ok(result);
  } catch (e) {
    return failFromError(e);
  }
}
