import { actionWithDetails, type Action } from "../domain/action";
import type { ActionRepository } from "../domain/action-repository";
import { ActionNotFoundError } from "../domain/errors";

import {
  updateActionDetailsSchema,
  type UpdateActionDetailsCmd,
} from "./schemas";

export const updateActionDetails = async (
  cmd: UpdateActionDetailsCmd,
  ctx: { userId: string; actions: ActionRepository },
): Promise<Action> => {
  const parsed = updateActionDetailsSchema.parse(cmd);
  const existing = await ctx.actions.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new ActionNotFoundError();

  const next = actionWithDetails(existing, {
    recurrence: parsed.recurrence,
    dueDate: parsed.dueDate,
  });
  await ctx.actions.update(next);
  return next;
};
