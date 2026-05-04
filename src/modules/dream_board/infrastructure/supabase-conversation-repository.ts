import type { JsonValue } from "@bufbuild/protobuf";
import { timestampDate } from "@bufbuild/protobuf/wkt";

import { IntegrationError } from "@/shared/errors";
import { fromProtoJson, toProtoJson } from "@/shared/proto/json";
import type { Json } from "@/shared/supabase/database.types";
import type { ServerSupabaseClient } from "@/shared/supabase/types";

import { type Conversation, ConversationSchema } from "../domain/conversation";
import type { ConversationRepository } from "../domain/conversation-repository";

/**
 * Supabase adapter for Conversation persistence. Same JSONB-backed shape
 * as every other entity in the codebase: promoted columns for RLS / order /
 * indexing, `data` carries the full proto message.
 *
 * A unique partial index on (user_id) where archived_at IS NULL enforces
 * "at most one active chat per user" at the database layer — the
 * `startConversation` use case also archives the existing active row first
 * to avoid tripping that index under normal flow.
 */
export class SupabaseConversationRepository implements ConversationRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async findActiveForUser(userId: string): Promise<Conversation | undefined> {
    const { data, error } = await this.db
      .from("dream_board_conversations")
      .select("data")
      .eq("user_id", userId)
      .is("archived_at", null)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    return data
      ? fromProtoJson(ConversationSchema, data.data as JsonValue)
      : undefined;
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Conversation | undefined> {
    const { data, error } = await this.db
      .from("dream_board_conversations")
      .select("data")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    return data
      ? fromProtoJson(ConversationSchema, data.data as JsonValue)
      : undefined;
  }

  async listByUser(userId: string): Promise<Conversation[]> {
    const { data, error } = await this.db
      .from("dream_board_conversations")
      .select("data")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map((row) =>
      fromProtoJson(ConversationSchema, row.data as JsonValue),
    );
  }

  async save(conv: Conversation): Promise<void> {
    const { error } = await this.db.from("dream_board_conversations").insert({
      id: conv.id,
      user_id: conv.userId,
      data: toProtoJson(ConversationSchema, conv) as Json,
      created_at: isoFromTimestamp(conv.createdAt),
      updated_at: isoFromTimestamp(conv.updatedAt),
      archived_at: conv.archivedAt ? isoFromTimestamp(conv.archivedAt) : null,
    });
    if (error) throw new IntegrationError(error.message);
  }

  async update(conv: Conversation): Promise<void> {
    const { error } = await this.db
      .from("dream_board_conversations")
      .update({
        data: toProtoJson(ConversationSchema, conv) as Json,
        updated_at: isoFromTimestamp(conv.updatedAt),
        archived_at: conv.archivedAt ? isoFromTimestamp(conv.archivedAt) : null,
        deleted_at: conv.deletedAt ? isoFromTimestamp(conv.deletedAt) : null,
      })
      .eq("id", conv.id)
      .eq("user_id", conv.userId);
    if (error) throw new IntegrationError(error.message);
  }
}

const isoFromTimestamp = (
  ts: Conversation["createdAt"] | undefined,
): string | undefined => (ts ? timestampDate(ts).toISOString() : undefined);
