import { Action } from "./Action";

/**
 * Port for Action persistence. Mirrors DreamRepository: implementations live
 * in `infrastructure/`, all queries are scoped by `user_id`, returns are
 * entities (or undefined for not-found).
 */
export interface ActionRepository {
  /** All non-deleted actions owned by `userId`, newest first. */
  listByUser(userId: string): Promise<Action[]>;

  /** All non-deleted actions for a given dream, scoped to the owner. */
  listByDreamForUser(dreamId: string, userId: string): Promise<Action[]>;

  /** Single action by id, scoped to the owner. */
  findByIdForUser(id: string, userId: string): Promise<Action | undefined>;

  save(action: Action): Promise<void>;

  /** Update an existing action — implementations match on (id, user_id). */
  update(action: Action): Promise<void>;
}
