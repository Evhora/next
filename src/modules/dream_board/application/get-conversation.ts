import type { Conversation } from "../domain/conversation";
import type { ConversationRepository } from "../domain/conversation-repository";
import type { DreamBoardRepository } from "../domain/dream-board-repository";
import { ConversationNotFoundError } from "../domain/errors";

export interface ConversationView {
  conversation: Conversation;
  /** Signed URL for the resulting board, if the chat finished with one. */
  imageUrl: string | null;
}

/** Load one chat by id — used when the user clicks a past entry. */
export const getConversation = async (
  cmd: { id: string },
  ctx: {
    userId: string;
    conversations: ConversationRepository;
    dreamBoards: DreamBoardRepository;
  },
): Promise<ConversationView> => {
  const conv = await ctx.conversations.findByIdForUser(cmd.id, ctx.userId);
  if (!conv) throw new ConversationNotFoundError();

  let imageUrl: string | null = null;
  if (conv.dreamBoardId) {
    const board = await ctx.dreamBoards.findByIdForUser(
      conv.dreamBoardId,
      ctx.userId,
    );
    if (board) imageUrl = await ctx.dreamBoards.signedUrlFor(board.storagePath);
  }
  return { conversation: conv, imageUrl };
};
