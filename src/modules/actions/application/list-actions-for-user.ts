import type { Action } from "../domain/action";
import type { ActionRepository } from "../domain/action-repository";

export const listActionsForUser = async (ctx: {
  userId: string;
  actions: ActionRepository;
}): Promise<Action[]> => ctx.actions.listByUser(ctx.userId);
