import { softDeleteAction } from "../domain/action";
import type { ActionRepository } from "../domain/action-repository";
import { ActionNotFoundError } from "../domain/errors";

import { deleteActionSchema, type DeleteActionCmd } from "./schemas";

export const deleteAction = async (
  cmd: DeleteActionCmd,
  ctx: { userId: string; actions: ActionRepository },
): Promise<void> => {
  const parsed = deleteActionSchema.parse(cmd);
  const existing = await ctx.actions.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new ActionNotFoundError();

  await ctx.actions.update(softDeleteAction(existing));
};
