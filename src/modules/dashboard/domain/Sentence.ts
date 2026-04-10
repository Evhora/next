/**
 * A motivational sentence shown on the dashboard greeting card. Sentences are
 * shared across users (no `user_id` column) — Postgres only filters by
 * `last_used_at` to bias the random pick toward unused entries.
 */
export interface SentenceProps {
  id: string;
  text: string;
  lastUsedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export class Sentence {
  private constructor(readonly props: SentenceProps) {}

  static rehydrate(props: SentenceProps): Sentence {
    return new Sentence(props);
  }
}
