import { describe, expect, it, vi } from "vitest";

import { newSession } from "../domain/session";
import type { SessionRepository } from "../domain/session-repository";
import { getActiveSession, TARGET_ANSWERS } from "./get-active-session";

const USER_ID = "user-abc";

describe("getActiveSession", () => {
  it("returns null when no active session exists", async () => {
    const repo: SessionRepository = {
      findActiveByUserId: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      listForUser: vi.fn(),
    };
    expect(await getActiveSession({ userId: USER_ID, discoverySessions: repo })).toBeNull();
  });

  it("returns summary with answersCount and targetAnswers", async () => {
    const session = newSession(USER_ID);
    const repo: SessionRepository = {
      findActiveByUserId: vi.fn().mockResolvedValue(session),
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      listForUser: vi.fn(),
    };

    const result = await getActiveSession({ userId: USER_ID, discoverySessions: repo });
    expect(result).not.toBeNull();
    expect(result!.answersCount).toBe(0);
    expect(result!.targetAnswers).toBe(TARGET_ANSWERS);
    expect(result!.hasCandidates).toBe(false);
  });
});
