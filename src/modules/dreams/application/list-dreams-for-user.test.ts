import { describe, expect, it, vi } from "vitest";

import { Dream_DreamAreaOfLife, newDream } from "../domain/dream";
import type { DreamRepository } from "../domain/dream-repository";
import { listDreamsForUser } from "./list-dreams-for-user";

const USER_ID = "user-abc";

const makeDream = (title: string) =>
  newDream(
    { title, areaOfLife: Dream_DreamAreaOfLife.LIFESTYLE, deadline: "2027-01-01", actionPlan: "Do it." },
    USER_ID,
  );

describe("listDreamsForUser", () => {
  it("returns all dreams from the repository", async () => {
    const d1 = makeDream("Dream A");
    const d2 = makeDream("Dream B");
    const dreams: DreamRepository = {
      listByUser: vi.fn().mockResolvedValue([d1, d2]),
      findByIdForUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    const result = await listDreamsForUser({ userId: USER_ID, dreams });

    expect(dreams.listByUser).toHaveBeenCalledWith(USER_ID);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Dream A");
  });

  it("returns empty array when no dreams", async () => {
    const dreams: DreamRepository = {
      listByUser: vi.fn().mockResolvedValue([]),
      findByIdForUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    const result = await listDreamsForUser({ userId: USER_ID, dreams });
    expect(result).toEqual([]);
  });
});
