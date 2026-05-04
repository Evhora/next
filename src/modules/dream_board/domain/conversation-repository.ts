import type { Conversation } from "./conversation";

/**
 * Port for Conversation persistence. Active = archived_at IS NULL; the
 * database also carries a unique partial index guaranteeing at most one
 * active row per user. Starting a new chat archives the current one.
 */
export interface ConversationRepository {
  /** Currently-active chat (archived_at IS NULL), or undefined. */
  findActiveForUser(userId: string): Promise<Conversation | undefined>;

  /** Single chat by id, scoped to the owner. */
  findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Conversation | undefined>;

  /** Every non-deleted chat for the user, newest first. */
  listByUser(userId: string): Promise<Conversation[]>;

  save(conv: Conversation): Promise<void>;
  update(conv: Conversation): Promise<void>;
}
