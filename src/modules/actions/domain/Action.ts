import type { DreamAreaOfLife } from "@/modules/dreams/domain/DreamAreaOfLife";

import { ActionRecurrence } from "./ActionRecurrence";
import { ActionStatus } from "./ActionStatus";

/**
 * Snapshot of every field an Action carries. The `dreamId` link and the
 * derived `dreamAreaOfLife` are both nullable: a user can plan an action that
 * isn't yet attached to a dream.
 */
export interface ActionProps {
  id: string;
  userId: string;
  dreamId: string | null;
  parentActionId: string | null;
  status: ActionStatus;
  title: string;
  dreamAreaOfLife: DreamAreaOfLife | null;
  recurrence: ActionRecurrence;
  dueDate: string | null; // ISO date
  version: number;
  sequence: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface NewActionInput {
  title: string;
  dreamId: string | null;
  dreamAreaOfLife: DreamAreaOfLife | null;
  recurrence: ActionRecurrence;
  dueDate: string | null;
}

/**
 * Aggregate root for the Actions bounded context. Same shape as Dream:
 * private constructor, factories for new vs rehydrated, immutable mutators.
 */
export class Action {
  private constructor(readonly props: ActionProps) {}

  static create(input: NewActionInput, userId: string): Action {
    const now = new Date().toISOString();
    return new Action({
      id: crypto.randomUUID(),
      userId,
      dreamId: input.dreamId,
      parentActionId: null,
      status: ActionStatus.NOT_STARTED,
      title: input.title.trim(),
      dreamAreaOfLife: input.dreamAreaOfLife,
      recurrence: input.recurrence,
      dueDate: input.dueDate,
      version: 1,
      sequence: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static rehydrate(props: ActionProps): Action {
    return new Action(props);
  }

  withStatus(next: ActionStatus): Action {
    return new Action({
      ...this.props,
      status: next,
      version: this.props.version + 1,
      updatedAt: new Date().toISOString(),
    });
  }

  softDelete(): Action {
    const now = new Date().toISOString();
    return new Action({
      ...this.props,
      version: this.props.version + 1,
      updatedAt: now,
      deletedAt: now,
    });
  }
}
