import { describe, expect, it, vi } from "vitest";

import { SessionStatus } from "../proto/v1/session_pb";
import { newSession } from "../domain/session";
import type { SessionRepository } from "../domain/session-repository";
import { startSession } from "./start-session";

const USER_ID = "user-abc";

const makeRepo = (existing?: ReturnType<typeof newSession>): SessionRepository => ({
  findActiveByUserId: vi.fn().mockResolvedValue(existing ?? null),
  findById: vi.fn(),
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn(),
  listForUser: vi.fn(),
});

describe("startSession", () => {
  it("creates a new session when none exists and returns first question", async () => {
    const repo = makeRepo();
    const result = await startSession({ userId: USER_ID, discoverySessions: repo });

    expect(result.kind).toBe("question");
    if (result.kind === "question") {
      expect(result.nextQuestion).toBeTruthy();
      expect(result.session.userId).toBe(USER_ID);
    }
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it("resumes existing session mid-quiz", async () => {
    const existing = newSession(USER_ID);
    const repo = makeRepo(existing);
    const result = await startSession({ userId: USER_ID, discoverySessions: repo });

    expect(result.kind).toBe("question");
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("returns reveal when candidates are already set", async () => {
    const existing = {
      ...newSession(USER_ID),
      candidates: [
        { $typeName: "modules.discovery.proto.v1.DreamCandidate" as const, id: "c1", title: "Dream", description: "...", areaOfLife: 5, selected: false },
      ],
    };
    const repo = makeRepo(existing as ReturnType<typeof newSession>);
    const result = await startSession({ userId: USER_ID, discoverySessions: repo });
    expect(result.kind).toBe("reveal");
  });

  it("returns resume_synthesis when session is in SYNTHESIZING status", async () => {
    const existing = { ...newSession(USER_ID), status: SessionStatus.SYNTHESIZING };
    const repo = makeRepo(existing as ReturnType<typeof newSession>);
    const result = await startSession({ userId: USER_ID, discoverySessions: repo });
    expect(result.kind).toBe("resume_synthesis");
  });
});
