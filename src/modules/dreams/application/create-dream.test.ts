import { describe, expect, it, vi } from "vitest";

import { Dream_DreamAreaOfLife, Dream_DreamStatus } from "../domain/dream";
import type { DreamRepository } from "../domain/dream-repository";
import { createDream } from "./create-dream";

const makeDreams = (): DreamRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn(),
  listByUser: vi.fn(),
  findByIdForUser: vi.fn(),
});

const USER_ID = "user-abc";

const VALID_CMD = {
  title: "Build a startup",
  areaOfLife: Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE,
  deadline: "2027-01-01",
  actionPlan: "Validate idea first.",
};

describe("createDream", () => {
  it("saves and returns the new dream", async () => {
    const dreams = makeDreams();
    const result = await createDream(VALID_CMD, { userId: USER_ID, dreams });

    expect(dreams.save).toHaveBeenCalledOnce();
    expect(dreams.save).toHaveBeenCalledWith(result);
    expect(result.userId).toBe(USER_ID);
    expect(result.title).toBe("Build a startup");
    expect(result.status).toBe(Dream_DreamStatus.IN_PROGRESS);
  });

  it("rejects empty title via schema", async () => {
    const dreams = makeDreams();
    await expect(
      createDream({ ...VALID_CMD, title: "" }, { userId: USER_ID, dreams }),
    ).rejects.toThrow();
    expect(dreams.save).not.toHaveBeenCalled();
  });

  it("rejects invalid deadline format", async () => {
    const dreams = makeDreams();
    await expect(
      createDream({ ...VALID_CMD, deadline: "01/01/2027" }, { userId: USER_ID, dreams }),
    ).rejects.toThrow();
  });

  it("rejects invalid areaOfLife", async () => {
    const dreams = makeDreams();
    await expect(
      createDream({ ...VALID_CMD, areaOfLife: 99 as Dream_DreamAreaOfLife }, { userId: USER_ID, dreams }),
    ).rejects.toThrow();
  });
});
