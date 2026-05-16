import { describe, expect, it, vi } from "vitest";

import {
  Action_ActionRecurrence,
  newAction,
} from "../domain/action";
import type { ActionRepository } from "../domain/action-repository";
import { ActionNotFoundError } from "../domain/errors";
import { updateActionDetails } from "./update-action-details";

const USER_ID = "user-abc";

const makeAction = () =>
  newAction(
    {
      title: "Read",
      dreamId: null,
      dreamAreaOfLife: null,
      recurrence: Action_ActionRecurrence.DAILY,
      dueDate: null,
    },
    USER_ID,
  );

describe("updateActionDetails", () => {
  it("patches recurrence and dueDate, persists", async () => {
    const existing = makeAction();
    const actions: ActionRepository = {
      findByIdForUser: vi.fn().mockResolvedValue(existing),
      update: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
      listByUser: vi.fn(),
      listByDreamForUser: vi.fn(),
    };

    const result = await updateActionDetails(
      { id: existing.id, recurrence: Action_ActionRecurrence.WEEKDAYS, dueDate: "2027-03-01" },
      { userId: USER_ID, actions },
    );

    expect(result.recurrence).toBe(Action_ActionRecurrence.WEEKDAYS);
    expect(result.dueDate).toBe("2027-03-01");
    expect(result.version).toBe(2n);
    expect(actions.update).toHaveBeenCalledWith(result);
  });

  it("throws ActionNotFoundError when action is missing", async () => {
    const actions: ActionRepository = {
      findByIdForUser: vi.fn().mockResolvedValue(undefined),
      update: vi.fn(),
      save: vi.fn(),
      listByUser: vi.fn(),
      listByDreamForUser: vi.fn(),
    };

    await expect(
      updateActionDetails(
        { id: crypto.randomUUID(), recurrence: Action_ActionRecurrence.ONCE, dueDate: null },
        { userId: USER_ID, actions },
      ),
    ).rejects.toThrow(ActionNotFoundError);
  });

  it("rejects invalid recurrence value", async () => {
    const actions: ActionRepository = {
      findByIdForUser: vi.fn(),
      update: vi.fn(),
      save: vi.fn(),
      listByUser: vi.fn(),
      listByDreamForUser: vi.fn(),
    };

    await expect(
      updateActionDetails(
        { id: crypto.randomUUID(), recurrence: 99 as Action_ActionRecurrence, dueDate: null },
        { userId: USER_ID, actions },
      ),
    ).rejects.toThrow();
  });
});
