import type { Conversation } from "../domain/conversation";
import type { ConversationRepository } from "../domain/conversation-repository";

/** The user's current non-archived chat, or null. */
export const getActiveConversation = async (ctx: {
  userId: string;
  conversations: ConversationRepository;
}): Promise<Conversation | null> => {
  const conv = await ctx.conversations.findActiveForUser(ctx.userId);
  return conv ?? null;
};
