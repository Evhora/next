import { describe, expect, it, vi } from "vitest";

import { Action_ActionRecurrence, newAction } from "../domain/action";
import type { ActionRepository } from "../domain/action-repository";
import { listActionsForUser } from "./list-actions-for-user";

const USER_ID = "user-abc";

const makeAction = (title: string) =>
  newAction(
    { title, dreamId: null, dreamAreaOfLife: null, recurrence: Action_ActionRecurrence.ONCE, dueDate: null },
    USER_ID,
  );

describe("listActionsForUser", () => {
  it("returns all actions from the repository", async () => {
    const a1 = makeAction("Action A");
    const a2 = makeAction("Action B");
    const actions: ActionRepository = {
      listByUser: vi.fn().mockResolvedValue([a1, a2]),
      listByDreamForUser: vi.fn(),
      findByIdForUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    const result = await listActionsForUser({ userId: USER_ID, actions });

    expect(actions.listByUser).toHaveBeenCalledWith(USER_ID);
    expect(result).toHaveLength(2);
  });

  it("returns empty array when no actions", async () => {
    const actions: ActionRepository = {
      listByUser: vi.fn().mockResolvedValue([]),
      listByDreamForUser: vi.fn(),
      findByIdForUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    const result = await listActionsForUser({ userId: USER_ID, actions });
    expect(result).toEqual([]);
  });
});
