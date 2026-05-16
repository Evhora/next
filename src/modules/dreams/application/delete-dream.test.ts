import { describe, expect, it, vi } from "vitest";

import { Dream_DreamAreaOfLife, newDream } from "../domain/dream";
import type { DreamRepository } from "../domain/dream-repository";
import { DreamNotFoundError } from "../domain/errors";
import { deleteDream } from "./delete-dream";

const USER_ID = "user-abc";

const makeDream = () =>
  newDream(
    {
      title: "Travel to Japan",
      areaOfLife: Dream_DreamAreaOfLife.LIFESTYLE,
      deadline: "2027-06-01",
      actionPlan: "Save money monthly.",
    },
    USER_ID,
  );

describe("deleteDream", () => {
  it("soft-deletes the dream", async () => {
    const existing = makeDream();
    const dreams: DreamRepository = {
      findByIdForUser: vi.fn().mockResolvedValue(existing),
      update: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
      listByUser: vi.fn(),
    };

    await deleteDream({ id: existing.id }, { userId: USER_ID, dreams });

    expect(dreams.update).toHaveBeenCalledOnce();
    const saved = vi.mocked(dreams.update).mock.calls[0][0];
    expect(saved.deletedAt).toBeTruthy();
    expect(saved.version).toBe(2n);
  });

  it("throws DreamNotFoundError when dream is missing", async () => {
    const dreams: DreamRepository = {
      findByIdForUser: vi.fn().mockResolvedValue(undefined),
      update: vi.fn(),
      save: vi.fn(),
      listByUser: vi.fn(),
    };

    await expect(
      deleteDream({ id: crypto.randomUUID() }, { userId: USER_ID, dreams }),
    ).rejects.toThrow(DreamNotFoundError);
  });
});
