import { describe, expect, it, vi } from "vitest";

import {
  Action_ActionRecurrence,
  Action_ActionStatus,
  newAction,
} from "../domain/action";
import type { ActionRepository } from "../domain/action-repository";
import { ActionNotFoundError } from "../domain/errors";
import { updateActionStatus } from "./update-action-status";

const USER_ID = "user-abc";

const makeAction = () =>
  newAction(
    {
      title: "Meditate",
      dreamId: null,
      dreamAreaOfLife: null,
      recurrence: Action_ActionRecurrence.DAILY,
      dueDate: null,
    },
    USER_ID,
  );

describe("updateActionStatus", () => {
  it("updates status and persists", async () => {
    const existing = makeAction();
    const actions: ActionRepository = {
      findByIdForUser: vi.fn().mockResolvedValue(existing),
      update: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
      listByUser: vi.fn(),
      listByDreamForUser: vi.fn(),
    };

    const result = await updateActionStatus(
      { id: existing.id, status: Action_ActionStatus.COMPLETED },
      { userId: USER_ID, actions },
    );

    expect(result.status).toBe(Action_ActionStatus.COMPLETED);
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
      updateActionStatus(
        { id: crypto.randomUUID(), status: Action_ActionStatus.IN_PROGRESS },
        { userId: USER_ID, actions },
      ),
    ).rejects.toThrow(ActionNotFoundError);

    expect(actions.update).not.toHaveBeenCalled();
  });

  it("rejects invalid status value", async () => {
    const actions: ActionRepository = {
      findByIdForUser: vi.fn(),
      update: vi.fn(),
      save: vi.fn(),
      listByUser: vi.fn(),
      listByDreamForUser: vi.fn(),
    };

    await expect(
      updateActionStatus(
        { id: crypto.randomUUID(), status: 99 as Action_ActionStatus },
        { userId: USER_ID, actions },
      ),
    ).rejects.toThrow();
  });
});
