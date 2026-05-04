import type { DreamBoard } from "./dream-board";

/**
 * Port for DreamBoard persistence. Repository reads/writes the JSONB row and
 * also owns Supabase Storage interactions for the generated PNG — callers
 * receive ready-to-render signed URLs without knowing storage details.
 */
export interface DreamBoardRepository {
  /** Non-deleted boards for `userId`, newest first. */
  listByUser(userId: string): Promise<DreamBoard[]>;

  /** Single board by id, scoped to the owner. */
  findByIdForUser(id: string, userId: string): Promise<DreamBoard | undefined>;

  /** Insert a brand-new board. */
  save(board: DreamBoard): Promise<void>;

  /** Update an existing board (matches on id + user_id). */
  update(board: DreamBoard): Promise<void>;

  /** Number of boards the user has created since `since` (UTC). */
  countCreatedSince(userId: string, since: Date): Promise<number>;

  /** Upload a PNG to storage and return the path it was written to. */
  uploadImage(userId: string, boardId: string, png: Uint8Array): Promise<string>;

  /** Delete the PNG from storage (no-op if already gone). */
  deleteImage(storagePath: string): Promise<void>;

  /** Short-lived signed URL for reading an image in the browser. */
  signedUrlFor(storagePath: string): Promise<string>;
}
