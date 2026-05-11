import { type Dream, dreamWithDetails } from "../domain/dream";
import type { DreamRepository } from "../domain/dream-repository";
import { DreamNotFoundError } from "../domain/errors";

import {
  updateDreamDetailsSchema,
  type UpdateDreamDetailsCmd,
} from "./schemas";

export const updateDreamDetails = async (
  cmd: UpdateDreamDetailsCmd,
  ctx: { userId: string; dreams: DreamRepository },
): Promise<Dream> => {
  const parsed = updateDreamDetailsSchema.parse(cmd);
  const existing = await ctx.dreams.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new DreamNotFoundError();

  const next = dreamWithDetails(existing, {
    deadline: parsed.deadline,
    actionPlan: parsed.actionPlan,
  });
  await ctx.dreams.update(next);
  return next;
};
