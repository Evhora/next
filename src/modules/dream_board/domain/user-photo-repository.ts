import type { UserPhoto } from "./user-photo";

/**
 * Port for the single UserPhoto row per user. Owns both the JSONB row and
 * the Storage object, so the application layer never opens a Supabase client.
 */
export interface UserPhotoRepository {
  findByUser(userId: string): Promise<UserPhoto | undefined>;

  save(photo: UserPhoto): Promise<void>;

  update(photo: UserPhoto): Promise<void>;

  /** Upload a JPEG to storage and return the path it was written to. */
  uploadImage(userId: string, jpeg: Uint8Array): Promise<string>;

  /** Download the raw bytes — used when compositing into Gemini. */
  downloadImage(storagePath: string): Promise<Uint8Array>;

  /** Short-lived signed URL for reading the photo in the browser. */
  signedUrlFor(storagePath: string): Promise<string>;
}
