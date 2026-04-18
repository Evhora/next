import type { JsonValue } from "@bufbuild/protobuf";
import { timestampDate } from "@bufbuild/protobuf/wkt";

import { IntegrationError } from "@/shared/errors";
import { fromProtoJson, toProtoJson } from "@/shared/proto/json";
import type { Json } from "@/shared/supabase/database.types";
import type { ServerSupabaseClient } from "@/shared/supabase/types";

import { type Dream, DreamSchema } from "../domain/dream";
import type { DreamRepository } from "../domain/dream-repository";

/**
 * Supabase implementation of DreamRepository. RLS already enforces that a user
 * cannot read or write another user's rows; we additionally scope every query
 * by `user_id` so a leaked id can't be used to leak existence either.
 *
 * The JSONB `data` column carries the full proto message; the promoted
 * columns (id, user_id, *_at) exist only for RLS/indexes/order. Reads project
 * `data` only and decode via `fromJson`; writes emit `toJson` into `data` and
 * mirror the timestamps into the promoted columns.
 */
export class SupabaseDreamRepository implements DreamRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async listByUser(userId: string): Promise<Dream[]> {
    const { data, error } = await this.db
      .from("dreams")
      .select("data")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map((row) =>
      fromProtoJson(DreamSchema, row.data as JsonValue),
    );
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Dream | undefined> {
    const { data, error } = await this.db
      .from("dreams")
      .select("data")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    return data
      ? fromProtoJson(DreamSchema, data.data as JsonValue)
      : undefined;
  }

  async save(dream: Dream): Promise<void> {
    const { error } = await this.db.from("dreams").insert({
      id: dream.id,
      user_id: dream.userId,
      data: toProtoJson(DreamSchema, dream) as Json,
      created_at: isoFromTimestamp(dream.createdAt),
      updated_at: isoFromTimestamp(dream.updatedAt),
    });
    if (error) throw new IntegrationError(error.message);
  }

  async update(dream: Dream): Promise<void> {
    const { error } = await this.db
      .from("dreams")
      .update({
        data: toProtoJson(DreamSchema, dream) as Json,
        updated_at: isoFromTimestamp(dream.updatedAt),
        deleted_at: dream.deletedAt ? isoFromTimestamp(dream.deletedAt) : null,
      })
      .eq("id", dream.id)
      .eq("user_id", dream.userId);
    if (error) throw new IntegrationError(error.message);
  }
}

const isoFromTimestamp = (
  ts: Dream["createdAt"] | undefined,
): string | undefined => (ts ? timestampDate(ts).toISOString() : undefined);
