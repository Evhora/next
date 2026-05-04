import {
  archiveConversation,
  newConversation,
  type Conversation,
} from "../domain/conversation";
import type { ConversationRepository } from "../domain/conversation-repository";

/**
 * Start a fresh chat. If one is already active, it's archived first (the
 * database also enforces "at most one active" via a unique partial index —
 * this archive step is what keeps the user inside that constraint).
 */
export const startConversation = async (ctx: {
  userId: string;
  conversations: ConversationRepository;
}): Promise<Conversation> => {
  const existing = await ctx.conversations.findActiveForUser(ctx.userId);
  if (existing) {
    await ctx.conversations.update(archiveConversation(existing));
  }
  const conv = newConversation(ctx.userId);
  await ctx.conversations.save(conv);
  return conv;
};
