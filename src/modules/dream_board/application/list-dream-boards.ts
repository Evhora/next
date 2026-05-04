import type { DreamBoard } from "../domain/dream-board";
import type { DreamBoardRepository } from "../domain/dream-board-repository";

export interface DreamBoardView {
  board: DreamBoard;
  imageUrl: string;
}

/**
 * List the user's saved boards with signed image URLs ready for `<img src>`.
 * Signed URLs are generated per request so the client can't forge them.
 */
export const listDreamBoards = async (ctx: {
  userId: string;
  dreamBoards: DreamBoardRepository;
}): Promise<DreamBoardView[]> => {
  const boards = await ctx.dreamBoards.listByUser(ctx.userId);
  return Promise.all(
    boards.map(async (board) => ({
      board,
      imageUrl: await ctx.dreamBoards.signedUrlFor(board.storagePath),
    })),
  );
};
