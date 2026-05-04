import type { JsonValue } from "@bufbuild/protobuf";
import { timestampDate } from "@bufbuild/protobuf/wkt";

import { IntegrationError } from "@/shared/errors";
import { fromProtoJson, toProtoJson } from "@/shared/proto/json";
import type { Json } from "@/shared/supabase/database.types";
import type { ServerSupabaseClient } from "@/shared/supabase/types";

import { type UserPhoto, UserPhotoSchema } from "../domain/user-photo";
import type { UserPhotoRepository } from "../domain/user-photo-repository";

const BUCKET = "user-photos";

/**
 * Supabase adapter for the one-row-per-user reference photo.
 *
 * Storage path is deterministic (`<user_id>.jpg`) so uploads always
 * overwrite — we only ever want one photo per user, and a deterministic
 * name makes orphan cleanup trivial.
 */
export class SupabaseUserPhotoRepository implements UserPhotoRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async findByUser(userId: string): Promise<UserPhoto | undefined> {
    const { data, error } = await this.db
      .from("user_photos")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    return data
      ? fromProtoJson(UserPhotoSchema, data.data as JsonValue)
      : undefined;
  }

  async save(photo: UserPhoto): Promise<void> {
    const { error } = await this.db.from("user_photos").insert({
      user_id: photo.userId,
      data: toProtoJson(UserPhotoSchema, photo) as Json,
      created_at: isoFromTimestamp(photo.createdAt),
      updated_at: isoFromTimestamp(photo.updatedAt),
    });
    if (error) throw new IntegrationError(error.message);
  }

  async update(photo: UserPhoto): Promise<void> {
    const { error } = await this.db
      .from("user_photos")
      .update({
        data: toProtoJson(UserPhotoSchema, photo) as Json,
        updated_at: isoFromTimestamp(photo.updatedAt),
      })
      .eq("user_id", photo.userId);
    if (error) throw new IntegrationError(error.message);
  }

  async uploadImage(userId: string, jpeg: Uint8Array): Promise<string> {
    const path = `${userId}.jpg`;
    const { error } = await this.db.storage.from(BUCKET).upload(path, jpeg, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (error) throw new IntegrationError(error.message);
    return path;
  }

  async downloadImage(storagePath: string): Promise<Uint8Array> {
    const { data, error } = await this.db.storage
      .from(BUCKET)
      .download(storagePath);
    if (error || !data) {
      throw new IntegrationError(error?.message ?? "Photo not found.");
    }
    return new Uint8Array(await data.arrayBuffer());
  }

  async signedUrlFor(storagePath: string): Promise<string> {
    const { data, error } = await this.db.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 60); // 1 hour
    if (error || !data?.signedUrl) {
      throw new IntegrationError(error?.message ?? "Could not sign URL.");
    }
    return data.signedUrl;
  }
}

const isoFromTimestamp = (
  ts: UserPhoto["createdAt"] | undefined,
): string | undefined => (ts ? timestampDate(ts).toISOString() : undefined);
