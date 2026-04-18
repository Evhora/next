import { newDream, type Dream } from "../domain/dream";
import type { DreamRepository } from "../domain/dream-repository";

import { createDreamSchema, type CreateDreamCmd } from "./schemas";

/**
 * Create a brand-new dream owned by the current user.
 *
 * The use case stays a plain async function so unit tests can pass any object
 * implementing `DreamRepository` — no DI container, no test doubles framework.
 */
export const createDream = async (
  cmd: CreateDreamCmd,
  ctx: { userId: string; dreams: DreamRepository },
): Promise<Dream> => {
  const parsed = createDreamSchema.parse(cmd);
  const dream = newDream(parsed, ctx.userId);
  await ctx.dreams.save(dream);
  return dream;
};
