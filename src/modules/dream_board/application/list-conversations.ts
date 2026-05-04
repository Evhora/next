import type { Conversation } from "../domain/conversation";
import type { ConversationRepository } from "../domain/conversation-repository";
import type { DreamBoardRepository } from "../domain/dream-board-repository";

export interface ConversationListItem {
  conversation: Conversation;
  /** Signed thumbnail URL when the chat produced a board; null otherwise. */
  imageUrl: string | null;
}

/**
 * List every chat the user has had, newest first. For finished chats we
 * attach a signed URL to the resulting board so the sidebar can render
 * thumbnails without an extra round-trip per item.
 */
export const listConversations = async (ctx: {
  userId: string;
  conversations: ConversationRepository;
  dreamBoards: DreamBoardRepository;
}): Promise<ConversationListItem[]> => {
  const convs = await ctx.conversations.listByUser(ctx.userId);
  return Promise.all(
    convs.map(async (conversation) => {
      if (!conversation.dreamBoardId) {
        return { conversation, imageUrl: null };
      }
      const board = await ctx.dreamBoards.findByIdForUser(
        conversation.dreamBoardId,
        ctx.userId,
      );
      const imageUrl = board
        ? await ctx.dreamBoards.signedUrlFor(board.storagePath)
        : null;
      return { conversation, imageUrl };
    }),
  );
};
