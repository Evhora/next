import { describe, expect, it } from "vitest";

import { Dream_DreamAreaOfLife } from "@/modules/dreams/domain/dream";

import {
  Action_ActionRecurrence,
  Action_ActionStatus,
  actionWithDetails,
  actionWithStatus,
  newAction,
  softDeleteAction,
} from "./action";

const USER_ID = "user-123";

const BASE_CMD = {
  title: "Write 500 words",
  dreamId: null,
  dreamAreaOfLife: null,
  recurrence: Action_ActionRecurrence.DAILY,
  dueDate: null,
};

describe("newAction", () => {
  it("creates an action with correct fields", () => {
    const action = newAction(BASE_CMD, USER_ID);
    expect(action.title).toBe("Write 500 words");
    expect(action.userId).toBe(USER_ID);
    expect(action.status).toBe(Action_ActionStatus.NOT_STARTED);
    expect(action.recurrence).toBe(Action_ActionRecurrence.DAILY);
    expect(action.version).toBe(1n);
    expect(action.id).toBeTruthy();
    expect(action.deletedAt).toBeUndefined();
  });

  it("links to a dream when dreamId is provided", () => {
    const dreamId = crypto.randomUUID();
    const action = newAction(
      { ...BASE_CMD, dreamId, dreamAreaOfLife: Dream_DreamAreaOfLife.LIFESTYLE },
      USER_ID,
    );
    expect(action.dreamId).toBe(dreamId);
    expect(action.dreamAreaOfLife).toBe(Dream_DreamAreaOfLife.LIFESTYLE);
  });

  it("sets dreamAreaOfLife to UNSPECIFIED when null", () => {
    const action = newAction(BASE_CMD, USER_ID);
    expect(action.dreamAreaOfLife).toBe(Dream_DreamAreaOfLife.UNSPECIFIED);
  });

  it("trims title", () => {
    const action = newAction({ ...BASE_CMD, title: "  Walk 10k  " }, USER_ID);
    expect(action.title).toBe("Walk 10k");
  });

  it("throws when title is blank", () => {
    expect(() => newAction({ ...BASE_CMD, title: "   " }, USER_ID)).toThrow(
      "Action title is required.",
    );
  });

  it("generates unique ids", () => {
    const a = newAction(BASE_CMD, USER_ID);
    const b = newAction(BASE_CMD, USER_ID);
    expect(a.id).not.toBe(b.id);
  });
});

describe("actionWithStatus", () => {
  it("updates status and bumps version", () => {
    const action = newAction(BASE_CMD, USER_ID);
    const updated = actionWithStatus(action, Action_ActionStatus.IN_PROGRESS);
    expect(updated.status).toBe(Action_ActionStatus.IN_PROGRESS);
    expect(updated.version).toBe(2n);
    expect(updated.id).toBe(action.id);
  });

  it("does not mutate the original", () => {
    const action = newAction(BASE_CMD, USER_ID);
    actionWithStatus(action, Action_ActionStatus.COMPLETED);
    expect(action.status).toBe(Action_ActionStatus.NOT_STARTED);
  });
});

describe("actionWithDetails", () => {
  it("applies patch and bumps version", () => {
    const action = newAction(BASE_CMD, USER_ID);
    const patched = actionWithDetails(action, {
      recurrence: Action_ActionRecurrence.WEEKDAYS,
      dueDate: "2027-03-01",
    });
    expect(patched.recurrence).toBe(Action_ActionRecurrence.WEEKDAYS);
    expect(patched.dueDate).toBe("2027-03-01");
    expect(patched.version).toBe(2n);
  });

  it("clears dueDate when null", () => {
    const action = newAction({ ...BASE_CMD, dueDate: "2027-01-01" }, USER_ID);
    const patched = actionWithDetails(action, {
      recurrence: Action_ActionRecurrence.ONCE,
      dueDate: null,
    });
    expect(patched.dueDate).toBeUndefined();
  });
});

describe("softDeleteAction", () => {
  it("sets deletedAt and bumps version", () => {
    const action = newAction(BASE_CMD, USER_ID);
    const deleted = softDeleteAction(action);
    expect(deleted.deletedAt).toBeTruthy();
    expect(deleted.version).toBe(2n);
    expect(deleted.id).toBe(action.id);
  });

  it("does not mutate the original", () => {
    const action = newAction(BASE_CMD, USER_ID);
    softDeleteAction(action);
    expect(action.deletedAt).toBeUndefined();
  });
});
