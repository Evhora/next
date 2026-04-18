import { type Dream, dreamWithStatus } from "../domain/dream";
import type { DreamRepository } from "../domain/dream-repository";
import { DreamNotFoundError } from "../domain/errors";

import {
  updateDreamStatusSchema,
  type UpdateDreamStatusCmd,
} from "./schemas";

/**
 * Move a dream to a new lifecycle status. Loads the entity first so the
 * version bump and updatedAt timestamp are computed by the domain rather than
 * the SQL layer.
 */
export const updateDreamStatus = async (
  cmd: UpdateDreamStatusCmd,
  ctx: { userId: string; dreams: DreamRepository },
): Promise<Dream> => {
  const parsed = updateDreamStatusSchema.parse(cmd);
  const existing = await ctx.dreams.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new DreamNotFoundError();

  const next = dreamWithStatus(existing, parsed.status);
  await ctx.dreams.update(next);
  return next;
};
