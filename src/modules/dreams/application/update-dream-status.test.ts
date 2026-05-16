import { describe, expect, it, vi } from "vitest";

import { Dream_DreamAreaOfLife, Dream_DreamStatus, newDream } from "../domain/dream";
import type { DreamRepository } from "../domain/dream-repository";
import { DreamNotFoundError } from "../domain/errors";
import { updateDreamStatus } from "./update-dream-status";

const USER_ID = "user-abc";

const makeDream = () =>
  newDream(
    {
      title: "Learn piano",
      areaOfLife: Dream_DreamAreaOfLife.LIFESTYLE,
      deadline: "2027-01-01",
      actionPlan: "Practice 30 min daily.",
    },
    USER_ID,
  );

describe("updateDreamStatus", () => {
  it("updates status and persists", async () => {
    const existing = makeDream();
    const dreams: DreamRepository = {
      findByIdForUser: vi.fn().mockResolvedValue(existing),
      update: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
      listByUser: vi.fn(),
    };

    const result = await updateDreamStatus(
      { id: existing.id, status: Dream_DreamStatus.COMPLETED },
      { userId: USER_ID, dreams },
    );

    expect(result.status).toBe(Dream_DreamStatus.COMPLETED);
    expect(result.version).toBe(2n);
    expect(dreams.update).toHaveBeenCalledWith(result);
  });

  it("throws DreamNotFoundError when dream is missing", async () => {
    const dreams: DreamRepository = {
      findByIdForUser: vi.fn().mockResolvedValue(undefined),
      update: vi.fn(),
      save: vi.fn(),
      listByUser: vi.fn(),
    };

    await expect(
      updateDreamStatus(
        { id: crypto.randomUUID(), status: Dream_DreamStatus.PAUSED },
        { userId: USER_ID, dreams },
      ),
    ).rejects.toThrow(DreamNotFoundError);

    expect(dreams.update).not.toHaveBeenCalled();
  });

  it("rejects invalid status value", async () => {
    const dreams: DreamRepository = {
      findByIdForUser: vi.fn(),
      update: vi.fn(),
      save: vi.fn(),
      listByUser: vi.fn(),
    };

    await expect(
      updateDreamStatus(
        { id: crypto.randomUUID(), status: 99 as Dream_DreamStatus },
        { userId: USER_ID, dreams },
      ),
    ).rejects.toThrow();
  });
});
