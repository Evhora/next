import { Dream } from "../domain/Dream";
import { DreamRepository } from "../domain/DreamRepository";

import { createDreamSchema, type CreateDreamInput } from "./schemas";

/**
 * Create a brand-new dream owned by the current user.
 *
 * The use case stays a plain async function so unit tests can pass any object
 * implementing `DreamRepository` — no DI container, no test doubles framework.
 */
export const createDream = async (
  input: CreateDreamInput,
  ctx: { userId: string; dreams: DreamRepository },
): Promise<Dream> => {
  const parsed = createDreamSchema.parse(input);
  const dream = Dream.create(parsed, ctx.userId);
  await ctx.dreams.save(dream);
  return dream;
};
