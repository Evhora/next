import { softDeleteDream } from "../domain/dream";
import type { DreamRepository } from "../domain/dream-repository";
import { DreamNotFoundError } from "../domain/errors";

import { deleteDreamSchema, type DeleteDreamCmd } from "./schemas";

/**
 * Soft-delete a dream. We never DELETE rows: the entity computes a new
 * `deletedAt` timestamp and bumps its version, then we persist that.
 */
export const deleteDream = async (
  cmd: DeleteDreamCmd,
  ctx: { userId: string; dreams: DreamRepository },
): Promise<void> => {
  const parsed = deleteDreamSchema.parse(cmd);
  const existing = await ctx.dreams.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new DreamNotFoundError();

  await ctx.dreams.update(softDeleteDream(existing));
};
