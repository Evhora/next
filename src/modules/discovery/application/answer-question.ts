import { create } from "@bufbuild/protobuf";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";

import type { Question } from "../proto/v1/question_pb";
import {
  AnswerSchema,
  DreamArcheologySessionSchema,
  type DreamArcheologySession,
} from "../proto/v1/session_pb";
import {
  PHASE_ORDER,
  QUESTIONS_BY_ID,
  QUESTIONS_BY_PHASE,
} from "../domain/question-bank";
import { SessionNotFoundError, SessionAlreadyCompletedError } from "../domain/errors";
import type { SessionRepository } from "../domain/session-repository";
import type { AnswerQuestionCmd } from "./schemas";
import { SessionStatus, Phase } from "../proto/v1/session_pb";

export interface AnswerQuestionResult {
  session: DreamArcheologySession;
  nextQuestion?: Question;
  shouldSynthesize: boolean;
}

const SYNTHESIS_MIN_ANSWERS = 15;
const SYNTHESIS_MIN_PHASES = 4;
const ANSWERS_PER_PHASE_TARGET = 3;

export const answerQuestion = async (
  cmd: AnswerQuestionCmd,
  ctx: {
    userId: string;
    discoverySessions: SessionRepository;
  },
): Promise<AnswerQuestionResult> => {
  const session = await ctx.discoverySessions.findById(cmd.sessionId);
  if (!session) throw new SessionNotFoundError();
  if (session.status === SessionStatus.COMPLETED) {
    throw new SessionAlreadyCompletedError();
  }

  const question = QUESTIONS_BY_ID.get(cmd.questionId);
  const answer = create(AnswerSchema, {
    questionId: cmd.questionId,
    phase: question?.phase ?? session.currentPhase,
    questionText: question?.prompt ?? "",
    text: cmd.text ?? "",
    skipped: cmd.skipped ?? false,
    answeredAt: timestampFromDate(new Date()),
  });

  const newAnswers = [...session.answers, answer];
  const nonSkipped = newAnswers.filter((a) => !a.skipped);
  const phasesCovered = new Set(nonSkipped.map((a) => a.phase));
  const answeredIds = new Set(newAnswers.map((a) => a.questionId));

  // Should we synthesize?
  const synthesisReady =
    nonSkipped.length >= SYNTHESIS_MIN_ANSWERS &&
    phasesCovered.size >= SYNTHESIS_MIN_PHASES;

  // Compute next question / phase.
  let nextQuestion: Question | undefined;
  let nextPhase: Phase = session.currentPhase;

  if (!synthesisReady) {
    const currentPhaseAnswered = nonSkipped.filter(
      (a) => a.phase === session.currentPhase,
    ).length;
    const phaseExhausted =
      currentPhaseAnswered >= ANSWERS_PER_PHASE_TARGET ||
      !hasUnansweredInPhase(session.currentPhase, answeredIds);

    if (phaseExhausted) {
      const idx = PHASE_ORDER.indexOf(session.currentPhase);
      for (let i = idx + 1; i < PHASE_ORDER.length; i++) {
        const q = firstUnansweredInPhase(PHASE_ORDER[i], answeredIds);
        if (q) {
          nextQuestion = q;
          nextPhase = PHASE_ORDER[i];
          break;
        }
      }
    } else {
      nextQuestion = firstUnansweredInPhase(session.currentPhase, answeredIds);
    }

    if (!nextQuestion) {
      for (const phase of PHASE_ORDER) {
        const q = firstUnansweredInPhase(phase, answeredIds);
        if (q) {
          nextQuestion = q;
          nextPhase = phase;
          break;
        }
      }
    }
  }

  const shouldSynthesize = synthesisReady || !nextQuestion;

  // Build the final state in a single mutation — one version bump,
  // one update, so the optimistic lock stays consistent.
  const updated = create(DreamArcheologySessionSchema, {
    ...session,
    answers: newAnswers,
    currentPhase: nextPhase,
    currentQuestionId: nextQuestion?.id ?? session.currentQuestionId,
    version: session.version + 1n,
    updatedAt: timestampFromDate(new Date()),
  });

  await ctx.discoverySessions.update(updated);

  if (shouldSynthesize) {
    return { session: updated, shouldSynthesize: true };
  }
  return { session: updated, nextQuestion, shouldSynthesize: false };
};

const firstUnansweredInPhase = (
  phase: Phase,
  answeredIds: Set<string>,
): Question | undefined =>
  QUESTIONS_BY_PHASE.get(phase)?.find((q) => !answeredIds.has(q.id));

const hasUnansweredInPhase = (phase: Phase, answeredIds: Set<string>): boolean =>
  !!firstUnansweredInPhase(phase, answeredIds);
