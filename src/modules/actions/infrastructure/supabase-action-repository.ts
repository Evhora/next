import type { JsonValue } from "@bufbuild/protobuf";
import { timestampDate } from "@bufbuild/protobuf/wkt";

import { IntegrationError } from "@/shared/errors";
import { fromProtoJson, toProtoJson } from "@/shared/proto/json";
import type { Json } from "@/shared/supabase/database.types";
import type { ServerSupabaseClient } from "@/shared/supabase/types";

import { type Action, ActionSchema } from "../domain/action";
import type { ActionRepository } from "../domain/action-repository";

/**
 * Supabase implementation of ActionRepository. Same conventions as the dreams
 * adapter: scope every query by `user_id`, wrap PostgREST errors in
 * IntegrationError, return entities not rows.
 *
 * The JSONB `data` column carries the full proto message; the promoted
 * columns (id, user_id, dream_id, parent_action_id, *_at) exist only for
 * RLS/indexes/FKs. Reads project `data` only; writes mirror the owned keys
 * and timestamps into the promoted columns.
 */
export class SupabaseActionRepository implements ActionRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async listByUser(userId: string): Promise<Action[]> {
    const { data, error } = await this.db
      .from("actions")
      .select("data")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map((row) =>
      fromProtoJson(ActionSchema, row.data as JsonValue),
    );
  }

  async listByDreamForUser(dreamId: string, userId: string): Promise<Action[]> {
    const { data, error } = await this.db
      .from("actions")
      .select("data")
      .eq("user_id", userId)
      .eq("dream_id", dreamId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map((row) =>
      fromProtoJson(ActionSchema, row.data as JsonValue),
    );
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Action | undefined> {
    const { data, error } = await this.db
      .from("actions")
      .select("data")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    return data
      ? fromProtoJson(ActionSchema, data.data as JsonValue)
      : undefined;
  }

  async save(action: Action): Promise<void> {
    const { error } = await this.db.from("actions").insert({
      id: action.id,
      user_id: action.userId,
      dream_id: action.dreamId ?? null,
      parent_action_id: action.parentActionId ?? null,
      data: toProtoJson(ActionSchema, action) as Json,
      created_at: isoFromTimestamp(action.createdAt),
      updated_at: isoFromTimestamp(action.updatedAt),
    });
    if (error) throw new IntegrationError(error.message);
  }

  async update(action: Action): Promise<void> {
    const { error } = await this.db
      .from("actions")
      .update({
        dream_id: action.dreamId ?? null,
        parent_action_id: action.parentActionId ?? null,
        data: toProtoJson(ActionSchema, action) as Json,
        updated_at: isoFromTimestamp(action.updatedAt),
        deleted_at: action.deletedAt
          ? isoFromTimestamp(action.deletedAt)
          : null,
      })
      .eq("id", action.id)
      .eq("user_id", action.userId);
    if (error) throw new IntegrationError(error.message);
  }
}

const isoFromTimestamp = (
  ts: Action["createdAt"] | undefined,
): string | undefined => (ts ? timestampDate(ts).toISOString() : undefined);
