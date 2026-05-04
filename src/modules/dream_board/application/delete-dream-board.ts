import { softDeleteDreamBoard } from "../domain/dream-board";
import type { DreamBoardRepository } from "../domain/dream-board-repository";
import { DreamBoardNotFoundError } from "../domain/errors";

import { deleteDreamBoardSchema, type DeleteDreamBoardCmd } from "./schemas";

/**
 * Soft-delete a DreamBoard and remove its Storage object. We keep the row
 * (versioned) so analytics and audit can still see what was generated, but
 * the PNG is freed immediately — storage is the expensive part.
 */
export const deleteDreamBoard = async (
  cmd: DeleteDreamBoardCmd,
  ctx: { userId: string; dreamBoards: DreamBoardRepository },
): Promise<void> => {
  const parsed = deleteDreamBoardSchema.parse(cmd);
  const existing = await ctx.dreamBoards.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new DreamBoardNotFoundError();

  await ctx.dreamBoards.update(softDeleteDreamBoard(existing));
  await ctx.dreamBoards.deleteImage(existing.storagePath).catch(() => {
    /* best-effort — row is already soft-deleted */
  });
};
