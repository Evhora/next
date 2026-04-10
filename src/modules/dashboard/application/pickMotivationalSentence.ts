import type { SentenceRepository } from "../domain/SentenceRepository";

/**
 * Pick one motivational sentence to show on the dashboard. Prefers sentences
 * that have never been shown (`lastUsedAt === null`); falls back to a uniform
 * random pick across the sample if every candidate has been used at least
 * once.
 *
 * Returns null if there are no sentences at all — caller should fall back to
 * a hard-coded default.
 */
export const pickMotivationalSentence = async (ctx: {
  sentences: SentenceRepository;
}): Promise<string | null> => {
  const sample = await ctx.sentences.sample(20);
  if (sample.length === 0) return null;

  const fresh = sample.filter((s) => s.props.lastUsedAt === null);
  const pool = fresh.length > 0 ? fresh : sample;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return picked.props.text;
};
