import { Action } from "../domain/Action";
import { ActionRepository } from "../domain/ActionRepository";

export const listActionsForUser = async (ctx: {
  userId: string;
  actions: ActionRepository;
}): Promise<Action[]> => ctx.actions.listByUser(ctx.userId);
