import type { DreamRepository } from "@/modules/dreams/domain/dream-repository";
import { ValidationError } from "@/shared/errors";
import { z } from "zod";

import {
  chooseDreams,
  chooseStyle,
  confirmPhotoUploaded,
  Conversation_ConversationState,
  goBackToStyle,
  markDone,
  markFailed,
  markGenerating,
  skipPhoto,
  startFromGreeting,
  type Conversation,
} from "../domain/conversation";
import type { ConversationRepository } from "../domain/conversation-repository";
import type { DreamBoardRepository } from "../domain/dream-board-repository";
import { ConversationNotFoundError } from "../domain/errors";
import { DREAM_BOARD_STYLE_LABELS } from "../domain/labels";
import type { UserPhotoRepository } from "../domain/user-photo-repository";

import type { DreamBoardImageClient } from "./generate-dream-board";
import { generateDreamBoard } from "./generate-dream-board";
import { SELECTABLE_DREAM_BOARD_STYLES } from "../domain/labels";
import { uploadUserPhoto } from "./upload-user-photo";

/**
 * Polymorphic reply from the user, mirrored in the chat state machine. Kept
 * as a tagged union so the reply schema and the transition function stay in
 * lock-step: adding a new reply `kind` forces you to add a `case` below.
 */
export const replyCmdSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("start") }),
  z.object({
    kind: z.literal("uploadPhoto"),
    dataUrl: z.string().regex(/^data:image\/(jpeg|png|webp);base64,/),
  }),
  z.object({ kind: z.literal("skipPhoto") }),
  z.object({
    kind: z.literal("chooseDreams"),
    dreamIds: z.array(z.string().uuid()).min(1).max(10),
  }),
  z.object({
    kind: z.literal("chooseStyle"),
    style: z
      .number()
      .int()
      .refine(
        (v): v is (typeof SELECTABLE_DREAM_BOARD_STYLES)[number] =>
          (SELECTABLE_DREAM_BOARD_STYLES as readonly number[]).includes(v),
      ),
  }),
  z.object({ kind: z.literal("back") }),
  z.object({ kind: z.literal("generate") }),
]);

export type ReplyCmd = z.infer<typeof replyCmdSchema>;

/**
 * Apply a user reply to a Conversation, advancing the state machine and
 * persisting the result. `generate` is the interesting case — it moves the
 * chat to GENERATING, calls `generateDreamBoard`, then transitions to DONE
 * (or FAILED on integration errors). Everything else is a straight domain
 * transition + save.
 */
export const replyToConversation = async (
  cmd: { conversationId: string; reply: ReplyCmd },
  ctx: {
    userId: string;
    conversations: ConversationRepository;
    dreams: DreamRepository;
    dreamBoards: DreamBoardRepository;
    userPhotos: UserPhotoRepository;
    imageClient: DreamBoardImageClient;
  },
): Promise<Conversation> => {
  const reply = replyCmdSchema.parse(cmd.reply);

  const current = await ctx.conversations.findByIdForUser(
    cmd.conversationId,
    ctx.userId,
  );
  if (!current) throw new ConversationNotFoundError();
  if (current.archivedAt || current.deletedAt) {
    throw new ValidationError("This conversation is no longer active.");
  }

  let next: Conversation;

  switch (reply.kind) {
    case "start":
      next = startFromGreeting(current);
      break;

    case "uploadPhoto":
      // Persist the photo first — if anything fails, the chat state stays
      // in ASK_PHOTO so the user can retry.
      await uploadUserPhoto({ dataUrl: reply.dataUrl }, ctx);
      next = confirmPhotoUploaded(current);
      break;

    case "skipPhoto":
      next = skipPhoto(current);
      break;

    case "chooseDreams": {
      // Only accept ids the user actually owns, then echo the titles back
      // into the user's message bubble.
      const allDreams = await ctx.dreams.listByUser(ctx.userId);
      const owned = reply.dreamIds.filter((id) =>
        allDreams.some((d) => d.id === id),
      );
      if (owned.length === 0) {
        throw new ValidationError("None of the selected dreams were found.");
      }
      const titles = owned
        .map((id) => allDreams.find((d) => d.id === id)?.title ?? "")
        .filter((t) => t.length > 0);
      next = chooseDreams(current, owned, titles);
      break;
    }

    case "chooseStyle": {
      const labelKey = DREAM_BOARD_STYLE_LABELS[reply.style];
      next = chooseStyle(current, reply.style, labelKey);
      break;
    }

    case "back":
      next = goBackToStyle(current);
      break;

    case "generate": {
      if (current.state !== Conversation_ConversationState.CONFIRM) {
        throw new ValidationError(
          "Conversation is not ready to generate.",
        );
      }
      // Atomically flip to GENERATING before calling Gemini so the UI can
      // render the spinner on a reload during the request.
      const generating = markGenerating(current);
      await ctx.conversations.update(generating);

      try {
        const board = await generateDreamBoard(
          {
            dreamIds: generating.selectedDreamIds,
            style: generating.selectedStyle,
            skipPhoto: generating.photoSkipped,
          },
          ctx,
        );
        next = markDone(generating, board.id);
      } catch (error) {
        // Known domain/integration errors surface a specific reason key so
        // the chat shows an actionable message instead of a stack trace.
        const reasonKey =
          error instanceof Error && "code" in error
            ? `pages.dreamBoard.chat.messages.failed.${(error as { code: string }).code}`
            : "pages.dreamBoard.chat.messages.failed.UNKNOWN";
        next = markFailed(generating, reasonKey);
        await ctx.conversations.update(next);
        throw error;
      }
      break;
    }
  }

  await ctx.conversations.update(next);
  return next;
};
