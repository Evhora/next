import type { JsonValue } from "@bufbuild/protobuf";
import { timestampDate } from "@bufbuild/protobuf/wkt";

import { AppError, IntegrationError } from "@/shared/errors";
import { fromProtoJson, toProtoJson } from "@/shared/proto/json";
import type { Json } from "@/shared/supabase/database.types";
import type { ServerSupabaseClient } from "@/shared/supabase/types";

import {
  type DreamArcheologySession,
  DreamArcheologySessionSchema,
  SessionStatus,
} from "../proto/v1/session_pb";
import type { SessionRepository } from "../domain/session-repository";

export class StaleSessionError extends AppError {
  constructor() {
    super("STALE_SESSION", "Session was modified concurrently. Reload and retry.");
  }
}

export class SupabaseSessionRepository implements SessionRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async save(session: DreamArcheologySession): Promise<void> {
    const { error } = await this.db.from("discovery_sessions").insert({
      id: session.id,
      user_id: session.userId,
      status: SessionStatus[session.status],
      version: Number(session.version),
      data: toProtoJson(DreamArcheologySessionSchema, session) as Json,
      started_at: isoFromTimestamp(session.startedAt),
      updated_at: isoFromTimestamp(session.updatedAt),
    });
    if (error) throw new IntegrationError(error.message);
  }

  async update(session: DreamArcheologySession): Promise<void> {
    // Optimistic lock: the domain bumps version every mutation, so the
    // pre-update DB row must hold version - 1. If not, someone raced us.
    const expectedPrev = Number(session.version - 1n);
    const { data, error } = await this.db
      .from("discovery_sessions")
      .update({
        status: SessionStatus[session.status],
        version: Number(session.version),
        data: toProtoJson(DreamArcheologySessionSchema, session) as Json,
        completed_at: session.completedAt
          ? isoFromTimestamp(session.completedAt)
          : null,
        updated_at: isoFromTimestamp(session.updatedAt),
      })
      .eq("id", session.id)
      .eq("user_id", session.userId)
      .eq("version", expectedPrev)
      .select("id");
    if (error) throw new IntegrationError(error.message);
    if (!data || data.length === 0) throw new StaleSessionError();
  }

  async findById(id: string): Promise<DreamArcheologySession | undefined> {
    const { data, error } = await this.db
      .from("discovery_sessions")
      .select("data")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new IntegrationError(error.message);
    return data
      ? fromProtoJson(DreamArcheologySessionSchema, data.data as JsonValue)
      : undefined;
  }

  async findActiveByUserId(
    userId: string,
  ): Promise<DreamArcheologySession | undefined> {
    const { data, error } = await this.db
      .from("discovery_sessions")
      .select("data")
      .eq("user_id", userId)
      .in("status", ["IN_PROGRESS", "SYNTHESIZING"])
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new IntegrationError(error.message);
    return data
      ? fromProtoJson(DreamArcheologySessionSchema, data.data as JsonValue)
      : undefined;
  }

  async listForUser(userId: string): Promise<DreamArcheologySession[]> {
    const { data, error } = await this.db
      .from("discovery_sessions")
      .select("data")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });
    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map((row) =>
      fromProtoJson(DreamArcheologySessionSchema, row.data as JsonValue),
    );
  }
}

const isoFromTimestamp = (
  ts: DreamArcheologySession["startedAt"] | undefined,
): string | undefined => (ts ? timestampDate(ts).toISOString() : undefined);
