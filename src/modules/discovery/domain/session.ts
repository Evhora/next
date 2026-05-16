import { create } from "@bufbuild/protobuf";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";

import {
  type Answer,
  type DreamArcheologySession,
  type DreamCandidate,
  DreamArcheologySessionSchema,
  Phase,
  SessionStatus,
} from "../proto/v1/session_pb";

export const newSession = (userId: string): DreamArcheologySession =>
  create(DreamArcheologySessionSchema, {
    id: crypto.randomUUID(),
    userId,
    answers: [],
    candidates: [],
    selectedCandidateId: "",
    currentPhase: Phase.CHILDHOOD,
    currentQuestionId: "",
    status: SessionStatus.IN_PROGRESS,
    version: 1n,
    startedAt: timestampFromDate(new Date()),
    updatedAt: timestampFromDate(new Date()),
  });

export const appendAnswer = (
  session: DreamArcheologySession,
  answer: Answer,
): DreamArcheologySession =>
  create(DreamArcheologySessionSchema, {
    ...session,
    answers: [...session.answers, answer],
    version: session.version + 1n,
    updatedAt: timestampFromDate(new Date()),
  });

export const advancePhase = (
  session: DreamArcheologySession,
  phase: Phase,
  nextQuestionId: string,
): DreamArcheologySession =>
  create(DreamArcheologySessionSchema, {
    ...session,
    currentPhase: phase,
    currentQuestionId: nextQuestionId,
    version: session.version + 1n,
    updatedAt: timestampFromDate(new Date()),
  });

export const setCandidates = (
  session: DreamArcheologySession,
  candidates: DreamCandidate[],
): DreamArcheologySession =>
  create(DreamArcheologySessionSchema, {
    ...session,
    candidates,
    status: SessionStatus.SYNTHESIZING,
    version: session.version + 1n,
    updatedAt: timestampFromDate(new Date()),
  });

export const markCompleted = (
  session: DreamArcheologySession,
): DreamArcheologySession =>
  create(DreamArcheologySessionSchema, {
    ...session,
    status: SessionStatus.COMPLETED,
    completedAt: timestampFromDate(new Date()),
    version: session.version + 1n,
    updatedAt: timestampFromDate(new Date()),
  });

export const markSynthesizing = (
  session: DreamArcheologySession,
): DreamArcheologySession =>
  create(DreamArcheologySessionSchema, {
    ...session,
    status: SessionStatus.SYNTHESIZING,
    version: session.version + 1n,
    updatedAt: timestampFromDate(new Date()),
  });
