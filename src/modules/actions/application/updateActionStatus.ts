import { Action } from "../domain/Action";
import { ActionRepository } from "../domain/ActionRepository";
import { ActionNotFoundError } from "../domain/errors";

import {
  updateActionStatusSchema,
  type UpdateActionStatusInput,
} from "./schemas";

export const updateActionStatus = async (
  input: UpdateActionStatusInput,
  ctx: { userId: string; actions: ActionRepository },
): Promise<Action> => {
  const parsed = updateActionStatusSchema.parse(input);
  const existing = await ctx.actions.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new ActionNotFoundError();

  const next = existing.withStatus(parsed.status);
  await ctx.actions.update(next);
  return next;
};
