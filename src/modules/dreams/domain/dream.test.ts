import { describe, expect, it } from "vitest";

import { Dream_DreamAreaOfLife, Dream_DreamStatus } from "./dream";
import {
  dreamWithDetails,
  dreamWithStatus,
  newDream,
  softDeleteDream,
} from "./dream";

const BASE_CMD = {
  title: "Learn to surf",
  areaOfLife: Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING,
  deadline: "2026-12-31",
  actionPlan: "Sign up for surf lessons.",
};

const USER_ID = "user-123";

describe("newDream", () => {
  it("creates a dream with correct fields", () => {
    const dream = newDream(BASE_CMD, USER_ID);
    expect(dream.title).toBe("Learn to surf");
    expect(dream.userId).toBe(USER_ID);
    expect(dream.status).toBe(Dream_DreamStatus.IN_PROGRESS);
    expect(dream.areaOfLife).toBe(Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING);
    expect(dream.deadline).toBe("2026-12-31");
    expect(dream.actionPlan).toBe("Sign up for surf lessons.");
    expect(dream.version).toBe(1n);
    expect(dream.id).toBeTruthy();
    expect(dream.createdAt).toBeTruthy();
    expect(dream.updatedAt).toBeTruthy();
    expect(dream.deletedAt).toBeUndefined();
  });

  it("trims title and actionPlan", () => {
    const dream = newDream({ ...BASE_CMD, title: "  Surf  ", actionPlan: "  Do it  " }, USER_ID);
    expect(dream.title).toBe("Surf");
    expect(dream.actionPlan).toBe("Do it");
  });

  it("throws when title is blank", () => {
    expect(() => newDream({ ...BASE_CMD, title: "   " }, USER_ID)).toThrow("Dream title is required.");
  });

  it("throws when actionPlan is blank", () => {
    expect(() => newDream({ ...BASE_CMD, actionPlan: "   " }, USER_ID)).toThrow("Dream action plan is required.");
  });

  it("generates unique ids", () => {
    const a = newDream(BASE_CMD, USER_ID);
    const b = newDream(BASE_CMD, USER_ID);
    expect(a.id).not.toBe(b.id);
  });
});

describe("dreamWithStatus", () => {
  it("updates status and bumps version", () => {
    const dream = newDream(BASE_CMD, USER_ID);
    const updated = dreamWithStatus(dream, Dream_DreamStatus.COMPLETED);
    expect(updated.status).toBe(Dream_DreamStatus.COMPLETED);
    expect(updated.version).toBe(2n);
    expect(updated.id).toBe(dream.id);
  });

  it("does not mutate the original", () => {
    const dream = newDream(BASE_CMD, USER_ID);
    dreamWithStatus(dream, Dream_DreamStatus.PAUSED);
    expect(dream.status).toBe(Dream_DreamStatus.IN_PROGRESS);
    expect(dream.version).toBe(1n);
  });
});

describe("dreamWithDetails", () => {
  it("applies patch and bumps version", () => {
    const dream = newDream(BASE_CMD, USER_ID);
    const patched = dreamWithDetails(dream, {
      deadline: "2027-06-01",
      actionPlan: "Updated plan.",
    });
    expect(patched.deadline).toBe("2027-06-01");
    expect(patched.actionPlan).toBe("Updated plan.");
    expect(patched.version).toBe(2n);
  });

  it("throws when patched actionPlan is blank", () => {
    const dream = newDream(BASE_CMD, USER_ID);
    expect(() => dreamWithDetails(dream, { deadline: "2027-06-01", actionPlan: "  " })).toThrow(
      "Dream action plan is required.",
    );
  });
});

describe("softDeleteDream", () => {
  it("sets deletedAt and bumps version", () => {
    const dream = newDream(BASE_CMD, USER_ID);
    const deleted = softDeleteDream(dream);
    expect(deleted.deletedAt).toBeTruthy();
    expect(deleted.version).toBe(2n);
    expect(deleted.id).toBe(dream.id);
  });

  it("does not mutate the original", () => {
    const dream = newDream(BASE_CMD, USER_ID);
    softDeleteDream(dream);
    expect(dream.deletedAt).toBeUndefined();
  });
});
