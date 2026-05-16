import { describe, expect, it, vi } from "vitest";

import { newSession } from "../domain/session";
import type { SessionRepository } from "../domain/session-repository";
import { SessionStatus } from "../proto/v1/session_pb";
import { abandonSession } from "./abandon-session";

const USER_ID = "user-abc";

describe("abandonSession", () => {
  it("marks active session as ABANDONED", async () => {
    const session = newSession(USER_ID);
    const repo: SessionRepository = {
      findActiveByUserId: vi.fn().mockResolvedValue(session),
      update: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      save: vi.fn(),
      listForUser: vi.fn(),
    };

    await abandonSession({ userId: USER_ID, discoverySessions: repo });

    expect(repo.update).toHaveBeenCalledOnce();
    const saved = vi.mocked(repo.update).mock.calls[0][0];
    expect(saved.status).toBe(SessionStatus.ABANDONED);
    expect(saved.version).toBe(2n);
  });

  it("is a no-op when there is no active session", async () => {
    const repo: SessionRepository = {
      findActiveByUserId: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      listForUser: vi.fn(),
    };

    await abandonSession({ userId: USER_ID, discoverySessions: repo });
    expect(repo.update).not.toHaveBeenCalled();
  });
});
