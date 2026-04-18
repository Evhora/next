import type { JsonValue } from "@bufbuild/protobuf";

import { IntegrationError } from "@/shared/errors";
import { fromProtoJson } from "@/shared/proto/json";
import type { ServerSupabaseClient } from "@/shared/supabase/types";

import { type Sentence, SentenceSchema } from "../domain/sentence";
import type { SentenceRepository } from "../domain/sentence-repository";

export class SupabaseSentenceRepository implements SentenceRepository {
  constructor(private readonly db: ServerSupabaseClient) {}

  async sample(limit: number): Promise<Sentence[]> {
    const { data, error } = await this.db
      .from("sentences")
      .select("data")
      .is("deleted_at", null)
      .order("last_used_at", { ascending: true, nullsFirst: true })
      .limit(limit);

    if (error) throw new IntegrationError(error.message);
    return (data ?? []).map((row) =>
      fromProtoJson(SentenceSchema, row.data as JsonValue),
    );
  }
}
