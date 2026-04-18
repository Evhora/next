import { create } from "@bufbuild/protobuf";
import { timestampNow } from "@bufbuild/protobuf/wkt";

import { Dream_DreamAreaOfLife } from "@/modules/dreams/domain/dream";

import {
  type Action,
  Action_ActionRecurrence,
  Action_ActionStatus,
  ActionSchema,
} from "@/modules/actions/proto/v1/action_pb";

/**
 * Domain surface for the Actions bounded context. Same shape as dreams:
 * generated proto type + free factory/mutator functions with invariants.
 *
 * `dreamAreaOfLife` is stored as a numeric snapshot of `Dream_DreamAreaOfLife`
 * so actions stay self-describing even if the parent dream's area changes.
 * `0` (UNSPECIFIED) means the action isn't linked to any area.
 *
 * Generated names are preserved verbatim — no short aliases.
 */

export { Action_ActionRecurrence, Action_ActionStatus, ActionSchema };
export type { Action };

export interface NewActionCmd {
  title: string;
  dreamId: string | null;
  dreamAreaOfLife: Dream_DreamAreaOfLife | null;
  recurrence: Action_ActionRecurrence;
  dueDate: string | null;
}

export function newAction(cmd: NewActionCmd, userId: string): Action {
  const title = cmd.title.trim();
  if (!title) throw new Error("Action title is required.");

  const now = timestampNow();
  return create(ActionSchema, {
    id: crypto.randomUUID(),
    userId,
    dreamId: cmd.dreamId ?? undefined,
    status: Action_ActionStatus.NOT_STARTED,
    title,
    dreamAreaOfLife: cmd.dreamAreaOfLife ?? Dream_DreamAreaOfLife.UNSPECIFIED,
    recurrence: cmd.recurrence,
    dueDate: cmd.dueDate ?? undefined,
    version: 1n,
    createdAt: now,
    updatedAt: now,
  });
}

export function actionWithStatus(
  action: Action,
  status: Action_ActionStatus,
): Action {
  return create(ActionSchema, {
    ...action,
    status,
    version: action.version + 1n,
    updatedAt: timestampNow(),
  });
}

export function softDeleteAction(action: Action): Action {
  const now = timestampNow();
  return create(ActionSchema, {
    ...action,
    version: action.version + 1n,
    updatedAt: now,
    deletedAt: now,
  });
}
