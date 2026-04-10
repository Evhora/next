import { IntegrationError } from "@/shared/errors";
import type { ServerSupabaseClient } from "@/shared/supabase/types";

import { Sentence } from "../domain/Sentence";
import { SentenceRepository } from "../domain/SentenceRepository";

import { toSentence } from "./sentenceMapper";

export class SupabaseSentenceRepository implements SentenceRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async sample(limit: number): Promise<Sentence[]> {
    const { data, error } = await this.db
      .from("sentences")
      .select("*")
      .is("deleted_at", null)
      .order("last_used_at", { ascending: true, nullsFirst: true })
      .limit(limit);

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map(toSentence);
  }
}
