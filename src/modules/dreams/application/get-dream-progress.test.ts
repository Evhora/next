import { describe, expect, it, vi } from "vitest";

import {
  Action_ActionRecurrence,
  Action_ActionStatus,
  newAction,
} from "@/modules/actions/domain/action";
import type { ActionRepository } from "@/modules/actions/domain/action-repository";

import { Dream_DreamAreaOfLife, newDream } from "../domain/dream";
import type { DreamRepository } from "../domain/dream-repository";
import { getDreamProgress } from "./get-dream-progress";

const USER_ID = "user-abc";

const makeDream = () =>
  newDream(
    { title: "A dream", areaOfLife: Dream_DreamAreaOfLife.LIFESTYLE, deadline: "2027-01-01", actionPlan: "Do it." },
    USER_ID,
  );

const makeAction = (dreamId: string, status: Action_ActionStatus) => {
  const a = newAction(
    { title: "Task", dreamId, dreamAreaOfLife: null, recurrence: Action_ActionRecurrence.ONCE, dueDate: null },
    USER_ID,
  );
  // Return a plain copy with the desired status (immutable pattern).
  return { ...a, status };
};

describe("getDreamProgress", () => {
  it("counts total and completed actions per dream", async () => {
    const dream = makeDream();
    const done = makeAction(dream.id, Action_ActionStatus.COMPLETED);
    const todo = makeAction(dream.id, Action_ActionStatus.NOT_STARTED);

    const dreams: DreamRepository = {
      listByUser: vi.fn().mockResolvedValue([dream]),
      findByIdForUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };
    const actions: ActionRepository = {
      listByUser: vi.fn().mockResolvedValue([done, todo]),
      listByDreamForUser: vi.fn(),
      findByIdForUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    const progress = await getDreamProgress({ userId: USER_ID, dreams, actions });

    expect(progress[dream.id]).toEqual({ total: 2, completed: 1 });
  });

  it("initialises zeros for dreams without actions", async () => {
    const dream = makeDream();
    const dreams: DreamRepository = {
      listByUser: vi.fn().mockResolvedValue([dream]),
      findByIdForUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };
    const actions: ActionRepository = {
      listByUser: vi.fn().mockResolvedValue([]),
      listByDreamForUser: vi.fn(),
      findByIdForUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    const progress = await getDreamProgress({ userId: USER_ID, dreams, actions });
    expect(progress[dream.id]).toEqual({ total: 0, completed: 0 });
  });

  it("ignores actions not linked to any known dream", async () => {
    const dream = makeDream();
    const orphan = makeAction(crypto.randomUUID(), Action_ActionStatus.COMPLETED);

    const dreams: DreamRepository = {
      listByUser: vi.fn().mockResolvedValue([dream]),
      findByIdForUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };
    const actions: ActionRepository = {
      listByUser: vi.fn().mockResolvedValue([orphan]),
      listByDreamForUser: vi.fn(),
      findByIdForUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    const progress = await getDreamProgress({ userId: USER_ID, dreams, actions });
    expect(progress[dream.id]).toEqual({ total: 0, completed: 0 });
    expect(Object.keys(progress)).toHaveLength(1);
  });
});
