import { ActionRepository } from "../domain/ActionRepository";
import { ActionNotFoundError } from "../domain/errors";

import { deleteActionSchema, type DeleteActionInput } from "./schemas";

export const deleteAction = async (
  input: DeleteActionInput,
  ctx: { userId: string; actions: ActionRepository },
): Promise<void> => {
  const parsed = deleteActionSchema.parse(input);
  const existing = await ctx.actions.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new ActionNotFoundError();

  await ctx.actions.update(existing.softDelete());
};
