import type { JsonValue } from "@bufbuild/protobuf";
import { timestampDate } from "@bufbuild/protobuf/wkt";

import { IntegrationError } from "@/shared/errors";
import { fromProtoJson, toProtoJson } from "@/shared/proto/json";
import type { Json } from "@/shared/supabase/database.types";
import type { ServerSupabaseClient } from "@/shared/supabase/types";

import { type DreamBoard, DreamBoardSchema } from "../domain/dream-board";
import type { DreamBoardRepository } from "../domain/dream-board-repository";

const BUCKET = "dream-boards";

/**
 * Supabase adapter for DreamBoard persistence + image Storage.
 *
 * Same JSONB-backed shape as the Dreams table: promoted columns (id, user_id,
 * *_at) for RLS / index / order, everything else in `data`. Every query is
 * scoped by both `id` and `user_id` even though RLS already enforces it —
 * belt-and-suspenders so a leaked id can't confirm existence.
 *
 * Storage objects live under `<user_id>/<board_id>.png` in a private bucket.
 * The repository is the only thing that ever sees storage paths; callers
 * receive signed URLs from `signedUrlFor`.
 */
export class SupabaseDreamBoardRepository implements DreamBoardRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async listByUser(userId: string): Promise<DreamBoard[]> {
    const { data, error } = await this.db
      .from("dream_boards")
      .select("data")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map((row) =>
      fromProtoJson(DreamBoardSchema, row.data as JsonValue),
    );
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<DreamBoard | undefined> {
    const { data, error } = await this.db
      .from("dream_boards")
      .select("data")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    return data
      ? fromProtoJson(DreamBoardSchema, data.data as JsonValue)
      : undefined;
  }

  async save(board: DreamBoard): Promise<void> {
    const { error } = await this.db.from("dream_boards").insert({
      id: board.id,
      user_id: board.userId,
      data: toProtoJson(DreamBoardSchema, board) as Json,
      created_at: isoFromTimestamp(board.createdAt),
      updated_at: isoFromTimestamp(board.updatedAt),
    });
    if (error) throw new IntegrationError(error.message);
  }

  async update(board: DreamBoard): Promise<void> {
    const { error } = await this.db
      .from("dream_boards")
      .update({
        data: toProtoJson(DreamBoardSchema, board) as Json,
        updated_at: isoFromTimestamp(board.updatedAt),
        deleted_at: board.deletedAt ? isoFromTimestamp(board.deletedAt) : null,
      })
      .eq("id", board.id)
      .eq("user_id", board.userId);
    if (error) throw new IntegrationError(error.message);
  }

  async countCreatedSince(userId: string, since: Date): Promise<number> {
    const { count, error } = await this.db
      .from("dream_boards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since.toISOString());

    if (error) throw new IntegrationError(error.message);
    return count ?? 0;
  }

  async uploadImage(
    userId: string,
    boardId: string,
    png: Uint8Array,
  ): Promise<string> {
    const path = `${userId}/${boardId}.png`;
    const { error } = await this.db.storage.from(BUCKET).upload(path, png, {
      contentType: "image/png",
      upsert: true,
    });
    if (error) throw new IntegrationError(error.message);
    return path;
  }

  async deleteImage(storagePath: string): Promise<void> {
    const { error } = await this.db.storage.from(BUCKET).remove([storagePath]);
    if (error) throw new IntegrationError(error.message);
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
  ts: DreamBoard["createdAt"] | undefined,
): string | undefined => (ts ? timestampDate(ts).toISOString() : undefined);
