import { Dream } from "./Dream";

/**
 * Port (interface) for Dream persistence. The application layer depends on
 * this; the only adapter today is SupabaseDreamRepository in infrastructure.
 *
 * Repository methods return entities (or undefined for not-found), never raw
 * rows. Filter/order semantics are exposed as method names rather than query
 * builders to keep the surface narrow and the call sites readable.
 */
export interface DreamRepository {
  /** All non-deleted dreams owned by `userId`, newest first. */
  listByUser(userId: string): Promise<Dream[]>;

  /** Single dream by id, scoped to the owner. Returns undefined if missing. */
  findByIdForUser(id: string, userId: string): Promise<Dream | undefined>;

  /** Insert a brand-new dream. */
  save(dream: Dream): Promise<void>;

  /**
   * Update an existing dream. Implementations should match on (id, user_id)
   * so that one user can never overwrite another's row even if id is leaked.
   */
  update(dream: Dream): Promise<void>;
}
