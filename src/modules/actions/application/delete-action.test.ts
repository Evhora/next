import { describe, expect, it, vi } from "vitest";

import { Action_ActionRecurrence, newAction } from "../domain/action";
import type { ActionRepository } from "../domain/action-repository";
import { ActionNotFoundError } from "../domain/errors";
import { deleteAction } from "./delete-action";

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

describe("deleteAction", () => {
  it("soft-deletes the action", async () => {
    const existing = makeAction();
    const actions: ActionRepository = {
      findByIdForUser: vi.fn().mockResolvedValue(existing),
      update: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
      listByUser: vi.fn(),
      listByDreamForUser: vi.fn(),
    };

    await deleteAction({ id: existing.id }, { userId: USER_ID, actions });

    expect(actions.update).toHaveBeenCalledOnce();
    const saved = vi.mocked(actions.update).mock.calls[0][0];
    expect(saved.deletedAt).toBeTruthy();
    expect(saved.version).toBe(2n);
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
      deleteAction({ id: crypto.randomUUID() }, { userId: USER_ID, actions }),
    ).rejects.toThrow(ActionNotFoundError);
  });
});
