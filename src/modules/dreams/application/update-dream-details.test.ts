import { describe, expect, it, vi } from "vitest";

import { Dream_DreamAreaOfLife, newDream } from "../domain/dream";
import type { DreamRepository } from "../domain/dream-repository";
import { DreamNotFoundError } from "../domain/errors";
import { updateDreamDetails } from "./update-dream-details";

const USER_ID = "user-abc";

const makeDream = () =>
  newDream(
    {
      title: "Write a book",
      areaOfLife: Dream_DreamAreaOfLife.LIFESTYLE,
      deadline: "2027-01-01",
      actionPlan: "Write 500 words per day.",
    },
    USER_ID,
  );

describe("updateDreamDetails", () => {
  it("applies patch, persists, and returns updated dream", async () => {
    const existing = makeDream();
    const dreams: DreamRepository = {
      findByIdForUser: vi.fn().mockResolvedValue(existing),
      update: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
      listByUser: vi.fn(),
    };

    const result = await updateDreamDetails(
      { id: existing.id, deadline: "2028-06-01", actionPlan: "Write 1000 words daily." },
      { userId: USER_ID, dreams },
    );

    expect(result.deadline).toBe("2028-06-01");
    expect(result.actionPlan).toBe("Write 1000 words daily.");
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
      updateDreamDetails(
        { id: crypto.randomUUID(), deadline: "2028-01-01", actionPlan: "Do it." },
        { userId: USER_ID, dreams },
      ),
    ).rejects.toThrow(DreamNotFoundError);
  });

  it("rejects blank actionPlan", async () => {
    const existing = makeDream();
    const dreams: DreamRepository = {
      findByIdForUser: vi.fn().mockResolvedValue(existing),
      update: vi.fn(),
      save: vi.fn(),
      listByUser: vi.fn(),
    };

    await expect(
      updateDreamDetails(
        { id: existing.id, deadline: "2028-01-01", actionPlan: "   " },
        { userId: USER_ID, dreams },
      ),
    ).rejects.toThrow();
    expect(dreams.update).not.toHaveBeenCalled();
  });
});
