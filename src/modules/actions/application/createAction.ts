import { Action } from "../domain/Action";
import { ActionRepository } from "../domain/ActionRepository";

import { createActionSchema, type CreateActionInput } from "./schemas";

export const createAction = async (
  input: CreateActionInput,
  ctx: { userId: string; actions: ActionRepository },
): Promise<Action> => {
  const parsed = createActionSchema.parse(input);
  const action = Action.create(parsed, ctx.userId);
  await ctx.actions.save(action);
  return action;
};
