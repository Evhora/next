import { actionWithStatus, type Action } from "../domain/action";
import type { ActionRepository } from "../domain/action-repository";
import { ActionNotFoundError } from "../domain/errors";

import {
  updateActionStatusSchema,
  type UpdateActionStatusCmd,
} from "./schemas";

export const updateActionStatus = async (
  cmd: UpdateActionStatusCmd,
  ctx: { userId: string; actions: ActionRepository },
): Promise<Action> => {
  const parsed = updateActionStatusSchema.parse(cmd);
  const existing = await ctx.actions.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new ActionNotFoundError();

  const next = actionWithStatus(existing, parsed.status);
  await ctx.actions.update(next);
  return next;
};
