import {
  softDeleteConversation,
} from "../domain/conversation";
import type { ConversationRepository } from "../domain/conversation-repository";
import type { DreamBoardRepository } from "../domain/dream-board-repository";
import { ConversationNotFoundError } from "../domain/errors";

import { deleteDreamBoard } from "./delete-dream-board";

/**
 * Delete a chat. Per product decision the chat and the board it produced
 * are one unit — deleting either removes both. We soft-delete the
 * conversation row (so we still have an audit trail) and fully delete the
 * board (image from storage + soft-delete its row) via the existing
 * `deleteDreamBoard` use case.
 */
export const deleteConversation = async (
  cmd: { id: string },
  ctx: {
    userId: string;
    conversations: ConversationRepository;
    dreamBoards: DreamBoardRepository;
  },
): Promise<void> => {
  const conv = await ctx.conversations.findByIdForUser(cmd.id, ctx.userId);
  if (!conv) throw new ConversationNotFoundError();

  if (conv.dreamBoardId) {
    await deleteDreamBoard({ id: conv.dreamBoardId }, ctx).catch(() => {
      /* board may already be gone — keep going and at least delete the chat */
    });
  }
  await ctx.conversations.update(softDeleteConversation(conv));
};
