import { createDream } from "@/modules/dreams";
import type { DreamRepository } from "@/modules/dreams";
import { Dream_DreamAreaOfLife } from "@/modules/dreams";

// Values accepted by createDream's zod schema. UNSPECIFIED (0) is rejected.
const SELECTABLE_AREAS: ReadonlySet<number> = new Set([
  Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP,
  Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING,
  Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE,
  Dream_DreamAreaOfLife.SPIRITUALITY,
  Dream_DreamAreaOfLife.LIFESTYLE,
]);
const DEFAULT_AREA = Dream_DreamAreaOfLife.LIFESTYLE;

const toSelectableArea = (value: number): Dream_DreamAreaOfLife =>
  SELECTABLE_AREAS.has(value)
    ? (value as Dream_DreamAreaOfLife)
    : DEFAULT_AREA;

import { markCompleted } from "../domain/session";
import { SessionNotFoundError, SessionAlreadyCompletedError } from "../domain/errors";
import type { SessionRepository } from "../domain/session-repository";
import type { DreamArcheologySession } from "../proto/v1/session_pb";
import { SessionStatus } from "../proto/v1/session_pb";

export interface SelectCandidatesResult {
  session: DreamArcheologySession;
  createdCount: number;
}

export const selectCandidates = async (
  cmd: { sessionId: string; candidateIds: string[] },
  ctx: {
    userId: string;
    discoverySessions: SessionRepository;
    dreams: DreamRepository;
  },
): Promise<SelectCandidatesResult> => {
  const session = await ctx.discoverySessions.findById(cmd.sessionId);
  if (!session) throw new SessionNotFoundError();
  if (session.status === SessionStatus.COMPLETED) {
    throw new SessionAlreadyCompletedError();
  }

  const deadline = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const chosen = session.candidates.filter((c) =>
    cmd.candidateIds.includes(c.id),
  );

  // Sequential so a mid-batch failure leaves a bounded partial state
  // (created dreams stand, session stays IN_PROGRESS for retry).
  let createdCount = 0;
  for (const candidate of chosen) {
    await createDream(
      {
        title: candidate.title,
        areaOfLife: toSelectableArea(candidate.areaOfLife),
        deadline,
        actionPlan: candidate.description,
      },
      ctx,
    );
    createdCount++;
  }

  if (createdCount !== chosen.length) {
    // Don't mark completed if not all dreams were created.
    return { session, createdCount };
  }

  const updated = markCompleted(session);
  await ctx.discoverySessions.update(updated);
  return { session: updated, createdCount };
};
