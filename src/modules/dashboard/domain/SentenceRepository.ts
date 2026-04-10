import { Sentence } from "./Sentence";

/**
 * Port for sentence persistence. Used only by the dashboard greeting today,
 * but lives in its own bounded context so future "daily quote" features
 * (notifications, history, etc) can grow here.
 */
export interface SentenceRepository {
  /**
   * Sample up to `limit` non-deleted sentences, biased toward those with no
   * `last_used_at`. The dashboard then picks one at random in the use case.
   */
  sample(limit: number): Promise<Sentence[]>;
}
