import { describe, expect, it, vi } from "vitest";

import {
  Action_ActionRecurrence,
  Action_ActionStatus,
  newAction,
} from "@/modules/actions/domain/action";
import type { ActionRepository } from "@/modules/actions/domain/action-repository";
import {
  Dream_DreamAreaOfLife,
  Dream_DreamStatus,
  newDream,
  dreamWithStatus,
} from "@/modules/dreams/domain/dream";
import type { DreamRepository } from "@/modules/dreams/domain/dream-repository";

import type { SentenceRepository } from "../domain/sentence-repository";
import { getDashboardSummary } from "./get-dashboard-summary";

const USER_ID = "user-abc";

const makeDream = (area = Dream_DreamAreaOfLife.LIFESTYLE, status = Dream_DreamStatus.IN_PROGRESS) => {
  const d = newDream({ title: "Dream", areaOfLife: area, deadline: "2027-01-01", actionPlan: "Do it." }, USER_ID);
  return status === Dream_DreamStatus.IN_PROGRESS ? d : dreamWithStatus(d, status);
};

const makeAction = (status: Action_ActionStatus, dueDate: string | null = null) => {
  const a = newAction(
    { title: "Task", dreamId: null, dreamAreaOfLife: null, recurrence: Action_ActionRecurrence.ONCE, dueDate },
    USER_ID,
  );
  return { ...a, status };
};

const makeSentences = (text = "Keep going."): SentenceRepository => ({
  sample: vi.fn().mockResolvedValue([
    { $typeName: "modules.dashboard.proto.v1.Sentence" as const, id: "s1", text, lastUsedAt: undefined },
  ]),
});

const makeRepos = (dreams = [] as ReturnType<typeof makeDream>[], actions = [] as ReturnType<typeof makeAction>[]) => ({
  dreams: { listByUser: vi.fn().mockResolvedValue(dreams), findByIdForUser: vi.fn(), save: vi.fn(), update: vi.fn() } as DreamRepository,
  actions: { listByUser: vi.fn().mockResolvedValue(actions), listByDreamForUser: vi.fn(), findByIdForUser: vi.fn(), save: vi.fn(), update: vi.fn() } as ActionRepository,
  sentences: makeSentences(),
});

describe("getDashboardSummary", () => {
  it("returns zeros and sentence for empty data", async () => {
    const ctx = { userId: USER_ID, ...makeRepos() };
    const summary = await getDashboardSummary(ctx);
    expect(summary.dreams.total).toBe(0);
    expect(summary.dreams.progressPercent).toBe(0);
    expect(summary.actions.total).toBe(0);
    expect(summary.motivationalSentence).toBe("Keep going.");
  });

  it("computes dream counts and progress", async () => {
    const d1 = makeDream(Dream_DreamAreaOfLife.LIFESTYLE, Dream_DreamStatus.COMPLETED);
    const d2 = makeDream(Dream_DreamAreaOfLife.LIFESTYLE, Dream_DreamStatus.IN_PROGRESS);
    const ctx = { userId: USER_ID, ...makeRepos([d1, d2]) };
    const summary = await getDashboardSummary(ctx);
    expect(summary.dreams.total).toBe(2);
    expect(summary.dreams.completed).toBe(1);
    expect(summary.dreams.progressPercent).toBe(50);
  });

  it("computes action counts and progress", async () => {
    const a1 = makeAction(Action_ActionStatus.COMPLETED);
    const a2 = makeAction(Action_ActionStatus.NOT_STARTED);
    const a3 = makeAction(Action_ActionStatus.NOT_STARTED);
    const ctx = { userId: USER_ID, ...makeRepos([], [a1, a2, a3]) };
    const summary = await getDashboardSummary(ctx);
    expect(summary.actions.total).toBe(3);
    expect(summary.actions.completed).toBe(1);
    expect(summary.actions.progressPercent).toBe(33);
  });

  it("counts today actions correctly", async () => {
    const today = new Date().toISOString().split("T")[0];
    const done = makeAction(Action_ActionStatus.COMPLETED, today);
    const pending = makeAction(Action_ActionStatus.NOT_STARTED, today);
    const other = makeAction(Action_ActionStatus.NOT_STARTED, "2020-01-01");
    const ctx = { userId: USER_ID, ...makeRepos([], [done, pending, other]) };
    const summary = await getDashboardSummary(ctx);
    expect(summary.todayActions.total).toBe(2);
    expect(summary.todayActions.completed).toBe(1);
    expect(summary.todayActions.progress).toBe(50);
  });

  it("returns null motivationalSentence when no sentences", async () => {
    const ctx = {
      userId: USER_ID,
      ...makeRepos(),
      sentences: { sample: vi.fn().mockResolvedValue([]) },
    };
    const summary = await getDashboardSummary(ctx);
    expect(summary.motivationalSentence).toBeNull();
  });
});
