"use server";

import { revalidatePath } from "next/cache";

import { buildCtx } from "@/shared/context";
import { failFromError, ok, type ActionResult } from "@/shared/result";

import { deleteConversation } from "../application/delete-conversation";
import {
  replyToConversation,
  type ReplyCmd,
} from "../application/reply-to-conversation";
import { startConversation } from "../application/start-conversation";

/**
 * Server actions for the chat-based DreamBoard UI. Only three actions are
 * needed because the chat state machine collapses everything into a single
 * polymorphic `reply` call:
 *
 *   - startNewChatAction         → archives the active chat, creates a new one
 *   - replyToConversationAction  → dispatches one of {start, uploadPhoto,
 *                                   skipPhoto, chooseDreams, chooseStyle,
 *                                   back, generate}
 *   - deleteConversationAction   → removes a chat AND its resulting board
 *
 * No free-text AI prompt is ever accepted. Photo data arrives as a data URL
 * after being resized client-side so the server never receives multi-MB
 * originals.
 */

const DREAM_BOARD_PATH = "/dashboard/dream-board";

export async function startNewChatAction(): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await buildCtx();
    const conv = await startConversation(ctx);
    revalidatePath(DREAM_BOARD_PATH);
    return ok({ id: conv.id });
  } catch (error) {
    return failFromError(error);
  }
}

export async function replyToConversationAction(
  conversationId: string,
  reply: ReplyCmd,
): Promise<ActionResult<{ state: number }>> {
  try {
    const ctx = await buildCtx();
    const conv = await replyToConversation(
      { conversationId, reply },
      ctx,
    );
    revalidatePath(DREAM_BOARD_PATH);
    return ok({ state: conv.state });
  } catch (error) {
    return failFromError(error);
  }
}

export async function deleteConversationAction(
  id: string,
): Promise<ActionResult> {
  try {
    const ctx = await buildCtx();
    await deleteConversation({ id }, ctx);
    revalidatePath(DREAM_BOARD_PATH);
    return ok(undefined);
  } catch (error) {
    return failFromError(error);
  }
}
