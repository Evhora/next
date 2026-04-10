import { IntegrationError } from "@/shared/errors";
import type { ServerSupabaseClient } from "@/shared/supabase/types";

import { Action } from "../domain/Action";
import { ActionRepository } from "../domain/ActionRepository";

import { toAction, toInsertRow, toUpdateRow } from "./actionMapper";

/**
 * Supabase implementation of ActionRepository. Same conventions as the dreams
 * adapter: scope every query by `user_id`, wrap PostgREST errors in
 * IntegrationError, return entities not rows.
 */
export class SupabaseActionRepository implements ActionRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async listByUser(userId: string): Promise<Action[]> {
    const { data, error } = await this.db
      .from("actions")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map(toAction);
  }

  async listByDreamForUser(
    dreamId: string,
    userId: string,
  ): Promise<Action[]> {
    const { data, error } = await this.db
      .from("actions")
      .select("*")
      .eq("user_id", userId)
      .eq("dream_id", dreamId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map(toAction);
  }

  async findByIdForUser(
    id: string,
    userId: string,
  ): Promise<Action | undefined> {
    const { data, error } = await this.db
      .from("actions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new IntegrationError(error.message);
    return data ? toAction(data) : undefined;
  }

  async save(action: Action): Promise<void> {
    const { error } = await this.db
      .from("actions")
      .insert(toInsertRow(action));
    if (error) throw new IntegrationError(error.message);
  }

  async update(action: Action): Promise<void> {
    const { error } = await this.db
      .from("actions")
      .update(toUpdateRow(action))
      .eq("id", action.props.id)
      .eq("user_id", action.props.userId);
    if (error) throw new IntegrationError(error.message);
  }
}
