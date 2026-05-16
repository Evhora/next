import { describe, expect, it, vi } from "vitest";

import { Action_ActionRecurrence, Action_ActionStatus } from "../domain/action";
import type { ActionRepository } from "../domain/action-repository";
import { createAction } from "./create-action";

const USER_ID = "user-abc";

const makActions = (): ActionRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn(),
  listByUser: vi.fn(),
  listByDreamForUser: vi.fn(),
  findByIdForUser: vi.fn(),
});

const VALID_CMD = {
  title: "Run 5km",
  dreamId: null,
  dreamAreaOfLife: null,
  recurrence: Action_ActionRecurrence.DAILY,
  dueDate: null,
};

describe("createAction", () => {
  it("saves and returns the new action", async () => {
    const actions = makActions();
    const result = await createAction(VALID_CMD, { userId: USER_ID, actions });

    expect(actions.save).toHaveBeenCalledOnce();
    expect(actions.save).toHaveBeenCalledWith(result);
    expect(result.userId).toBe(USER_ID);
    expect(result.title).toBe("Run 5km");
    expect(result.status).toBe(Action_ActionStatus.NOT_STARTED);
  });

  it("rejects empty title", async () => {
    const actions = makActions();
    await expect(
      createAction({ ...VALID_CMD, title: "" }, { userId: USER_ID, actions }),
    ).rejects.toThrow();
    expect(actions.save).not.toHaveBeenCalled();
  });

  it("rejects invalid recurrence", async () => {
    const actions = makActions();
    await expect(
      createAction(
        { ...VALID_CMD, recurrence: 99 as Action_ActionRecurrence },
        { userId: USER_ID, actions },
      ),
    ).rejects.toThrow();
  });

  it("rejects malformed dueDate", async () => {
    const actions = makActions();
    await expect(
      createAction({ ...VALID_CMD, dueDate: "31-12-2027" }, { userId: USER_ID, actions }),
    ).rejects.toThrow();
  });

  it("accepts valid dueDate", async () => {
    const actions = makActions();
    const result = await createAction(
      { ...VALID_CMD, dueDate: "2027-12-31" },
      { userId: USER_ID, actions },
    );
    expect(result.dueDate).toBe("2027-12-31");
  });
});
