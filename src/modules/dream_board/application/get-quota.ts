import type { DreamBoardRepository } from "../domain/dream-board-repository";

export interface DreamBoardQuota {
  limit: number;
  used: number;
  remaining: number;
}

const DEFAULT_DAILY_LIMIT = 3;

/**
 * Daily cap read from `DREAM_BOARD_DAILY_LIMIT` (integer). Falls back to 3.
 * Exported so the generate/regenerate use cases share the same source.
 */
export const getDailyLimit = (): number => {
  const raw = process.env.DREAM_BOARD_DAILY_LIMIT;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_LIMIT;
};

export const startOfUtcDay = (): Date => {
  const d = new Date();
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
};

/**
 * Report the user's daily generation budget so the UI can show
 * "2 of 3 remaining" and disable the Generate button when empty.
 */
export const getDreamBoardQuota = async (ctx: {
  userId: string;
  dreamBoards: DreamBoardRepository;
}): Promise<DreamBoardQuota> => {
  const limit = getDailyLimit();
  const used = await ctx.dreamBoards.countCreatedSince(
    ctx.userId,
    startOfUtcDay(),
  );
  return { limit, used, remaining: Math.max(0, limit - used) };
};
