import { DreamRepository } from "../domain/DreamRepository";
import { DreamNotFoundError } from "../domain/errors";

import { deleteDreamSchema, type DeleteDreamInput } from "./schemas";

/**
 * Soft-delete a dream. We never DELETE rows: the entity computes a new
 * `deletedAt` timestamp and bumps its version, then we persist that.
 */
export const deleteDream = async (
  input: DeleteDreamInput,
  ctx: { userId: string; dreams: DreamRepository },
): Promise<void> => {
  const parsed = deleteDreamSchema.parse(input);
  const existing = await ctx.dreams.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new DreamNotFoundError();

  await ctx.dreams.update(existing.softDelete());
};
