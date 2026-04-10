import { Dream } from "../domain/Dream";
import { DreamRepository } from "../domain/DreamRepository";
import { DreamNotFoundError } from "../domain/errors";

import {
  updateDreamStatusSchema,
  type UpdateDreamStatusInput,
} from "./schemas";

/**
 * Move a dream to a new lifecycle status. Loads the entity first so the
 * version bump and updatedAt timestamp are computed by the domain rather than
 * the SQL layer.
 */
export const updateDreamStatus = async (
  input: UpdateDreamStatusInput,
  ctx: { userId: string; dreams: DreamRepository },
): Promise<Dream> => {
  const parsed = updateDreamStatusSchema.parse(input);
  const existing = await ctx.dreams.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new DreamNotFoundError();

  const next = existing.withStatus(parsed.status);
  await ctx.dreams.update(next);
  return next;
};
