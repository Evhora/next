import { newAction, type Action } from "../domain/action";
import type { ActionRepository } from "../domain/action-repository";

import { createActionSchema, type CreateActionCmd } from "./schemas";

export const createAction = async (
  cmd: CreateActionCmd,
  ctx: { userId: string; actions: ActionRepository },
): Promise<Action> => {
  const parsed = createActionSchema.parse(cmd);
  const action = newAction(parsed, ctx.userId);
  await ctx.actions.save(action);
  return action;
};
