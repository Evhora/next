import type { Question } from "../proto/v1/question_pb";
import { newSession } from "../domain/session";
import {
  PHASE_ORDER,
  QUESTIONS_BY_PHASE,
  firstQuestionForPhase,
} from "../domain/question-bank";
import type { SessionRepository } from "../domain/session-repository";
import {
  type DreamArcheologySession,
  SessionStatus,
} from "../proto/v1/session_pb";

const SYNTHESIS_MIN_ANSWERS = 15;
const SYNTHESIS_MIN_PHASES = 4;

export type StartSessionResult =
  | { kind: "question"; session: DreamArcheologySession; nextQuestion: Question }
  | { kind: "reveal"; session: DreamArcheologySession }
  | { kind: "resume_synthesis"; session: DreamArcheologySession };

export const startSession = async (ctx: {
  userId: string;
  discoverySessions: SessionRepository;
}): Promise<StartSessionResult> => {
  const existing = await ctx.discoverySessions.findActiveByUserId(ctx.userId);

  if (existing) {
    // Candidates already produced — jump back to reveal.
    if (existing.candidates.length > 0) {
      return { kind: "reveal", session: existing };
    }

    // Mid-synthesis crash, or threshold reached but synth never fired —
    // tell the client to re-trigger synthesizeAction.
    const nonSkipped = existing.answers.filter((a) => !a.skipped);
    const phasesCovered = new Set(nonSkipped.map((a) => a.phase));
    const synthDue =
      existing.status === SessionStatus.SYNTHESIZING ||
      (nonSkipped.length >= SYNTHESIS_MIN_ANSWERS &&
        phasesCovered.size >= SYNTHESIS_MIN_PHASES);
    if (synthDue) {
      return { kind: "resume_synthesis", session: existing };
    }

    const answeredIds = new Set(existing.answers.map((a) => a.questionId));
    const nextQuestion = findNextUnanswered(answeredIds, existing.currentPhase);
    if (nextQuestion) {
      return { kind: "question", session: existing, nextQuestion };
    }

    // Edge case: no questions left but threshold not met. Force synth anyway.
    return { kind: "resume_synthesis", session: existing };
  }

  const session = newSession(ctx.userId);
  const nextQuestion = firstQuestionForPhase(PHASE_ORDER[0])!;
  await ctx.discoverySessions.save(session);
  return { kind: "question", session, nextQuestion };
};

const findNextUnanswered = (
  answeredIds: Set<string>,
  currentPhase: DreamArcheologySession["currentPhase"],
): Question | undefined => {
  const phaseIdx = PHASE_ORDER.indexOf(currentPhase);
  for (let i = phaseIdx; i < PHASE_ORDER.length; i++) {
    const q = QUESTIONS_BY_PHASE.get(PHASE_ORDER[i])?.find(
      (q) => !answeredIds.has(q.id),
    );
    if (q) return q;
  }
  return undefined;
};
