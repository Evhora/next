import { IntegrationError } from "@/shared/errors";
import type { ServerSupabaseClient } from "@/shared/supabase/types";

import { Dream } from "../domain/Dream";
import { DreamRepository } from "../domain/DreamRepository";

import { toDream, toInsertRow, toUpdateRow } from "./dreamMapper";

/**
 * Supabase implementation of DreamRepository. RLS already enforces that a user
 * cannot read or write another user's rows; we additionally scope every query
 * by `user_id` so a leaked id can't be used to leak existence either.
 *
 * All Supabase errors are wrapped in IntegrationError so the application layer
 * never has to know that we're talking to PostgREST.
 */
export class SupabaseDreamRepository implements DreamRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async listByUser(userId: string): Promise<Dream[]> {
    const { data, error } = await this.db
      .from("dreams")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map(toDream);
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Dream | undefined> {
    const { data, error } = await this.db
      .from("dreams")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    return data ? toDream(data) : undefined;
  }

  async save(dream: Dream): Promise<void> {
    const { error } = await this.db.from("dreams").insert(toInsertRow(dream));
    if (error) throw new IntegrationError(error.message);
  }

  async update(dream: Dream): Promise<void> {
    const { error } = await this.db
      .from("dreams")
      .update(toUpdateRow(dream))
      .eq("id", dream.props.id)
      .eq("user_id", dream.props.userId);
    if (error) throw new IntegrationError(error.message);
  }
}
