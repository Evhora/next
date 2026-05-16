import type { SessionRepository } from "../domain/session-repository";
import type { DreamArcheologySession } from "../proto/v1/session_pb";

export interface ActiveSessionSummary {
  session: DreamArcheologySession;
  answersCount: number;
  /** Heuristic target for "completion" — same threshold the answer use case uses. */
  targetAnswers: number;
  hasCandidates: boolean;
}

export const TARGET_ANSWERS = 15;

export const getActiveSession = async (ctx: {
  userId: string;
  discoverySessions: SessionRepository;
}): Promise<ActiveSessionSummary | null> => {
  const session = await ctx.discoverySessions.findActiveByUserId(ctx.userId);
  if (!session) return null;
  return {
    session,
    answersCount: session.answers.filter((a) => !a.skipped).length,
    targetAnswers: TARGET_ANSWERS,
    hasCandidates: session.candidates.length > 0,
  };
};
