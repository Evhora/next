import { describe, expect, it } from "vitest";

import { Phase, SessionStatus } from "../proto/v1/session_pb";
import {
  advancePhase,
  appendAnswer,
  markCompleted,
  markSynthesizing,
  newSession,
  setCandidates,
} from "./session";

const USER_ID = "user-123";

const makeAnswer = (id: string, phase = Phase.CHILDHOOD, skipped = false) => ({
  $typeName: "modules.discovery.proto.v1.Answer" as const,
  questionId: id,
  phase,
  questionText: "A question",
  text: "An answer",
  skipped,
  answeredAt: undefined,
});

describe("newSession", () => {
  it("creates session with CHILDHOOD phase and IN_PROGRESS status", () => {
    const session = newSession(USER_ID);
    expect(session.userId).toBe(USER_ID);
    expect(session.currentPhase).toBe(Phase.CHILDHOOD);
    expect(session.status).toBe(SessionStatus.IN_PROGRESS);
    expect(session.version).toBe(1n);
    expect(session.answers).toHaveLength(0);
    expect(session.candidates).toHaveLength(0);
  });

  it("generates unique ids", () => {
    expect(newSession(USER_ID).id).not.toBe(newSession(USER_ID).id);
  });
});

describe("appendAnswer", () => {
  it("appends answer and bumps version", () => {
    const session = newSession(USER_ID);
    const answer = makeAnswer("q1");
    const updated = appendAnswer(session, answer);
    expect(updated.answers).toHaveLength(1);
    expect(updated.answers[0].questionId).toBe("q1");
    expect(updated.version).toBe(2n);
  });

  it("does not mutate the original", () => {
    const session = newSession(USER_ID);
    appendAnswer(session, makeAnswer("q1"));
    expect(session.answers).toHaveLength(0);
  });
});

describe("advancePhase", () => {
  it("updates phase and question id, bumps version", () => {
    const session = newSession(USER_ID);
    const updated = advancePhase(session, Phase.ADULTHOOD, "adult-1");
    expect(updated.currentPhase).toBe(Phase.ADULTHOOD);
    expect(updated.currentQuestionId).toBe("adult-1");
    expect(updated.version).toBe(2n);
  });
});

describe("setCandidates", () => {
  it("sets candidates and marks SYNTHESIZING", () => {
    const session = newSession(USER_ID);
    const candidates = [
      { $typeName: "modules.discovery.proto.v1.DreamCandidate" as const, id: "c1", title: "Start a business", description: "...", areaOfLife: 3, selected: false },
    ];
    const updated = setCandidates(session, candidates);
    expect(updated.candidates).toHaveLength(1);
    expect(updated.status).toBe(SessionStatus.SYNTHESIZING);
    expect(updated.version).toBe(2n);
  });
});

describe("markCompleted", () => {
  it("sets COMPLETED status and completedAt", () => {
    const session = newSession(USER_ID);
    const completed = markCompleted(session);
    expect(completed.status).toBe(SessionStatus.COMPLETED);
    expect(completed.completedAt).toBeTruthy();
    expect(completed.version).toBe(2n);
  });
});

describe("markSynthesizing", () => {
  it("sets SYNTHESIZING status", () => {
    const session = newSession(USER_ID);
    const updated = markSynthesizing(session);
    expect(updated.status).toBe(SessionStatus.SYNTHESIZING);
    expect(updated.version).toBe(2n);
  });
});
