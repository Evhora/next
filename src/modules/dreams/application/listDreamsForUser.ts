import { Dream } from "../domain/Dream";
import { DreamRepository } from "../domain/DreamRepository";

/**
 * List every active dream owned by the current user, newest first.
 *
 * Trivial today — but it stays a use case so the Server Component never
 * imports the repository directly. When we eventually add a "filter by area"
 * query param, this is the one place that learns about it.
 */
export const listDreamsForUser = async (ctx: {
  userId: string;
  dreams: DreamRepository;
}): Promise<Dream[]> => ctx.dreams.listByUser(ctx.userId);
