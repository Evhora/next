import type { DreamRepository } from "@/modules/dreams/domain/dream-repository";
import { ValidationError } from "@/shared/errors";

import { newDreamBoard, type DreamBoard } from "../domain/dream-board";
import type { DreamBoardRepository } from "../domain/dream-board-repository";
import { DailyQuotaExceededError } from "../domain/errors";
import type { UserPhotoRepository } from "../domain/user-photo-repository";

import { getDailyLimit, startOfUtcDay } from "./get-quota";
import {
  generateDreamBoardSchema,
  type GenerateDreamBoardCmd,
} from "./schemas";

export interface DreamBoardImageClient {
  generate(input: {
    dreamTitles: string[];
    style: DreamBoard["style"];
    /** Omit for a no-photo generation (random person in the scene). */
    photo?: { bytes: Uint8Array; mimeType: string };
  }): Promise<Uint8Array>;
}

/**
 * Generate a new DreamBoard.
 *
 * Guardrails in order:
 *   1. Daily cap per user (env `DREAM_BOARD_DAILY_LIMIT`, default 3).
 *   2. Photo is optional. If the user uploaded one AND `skipPhoto` is false,
 *      we fuse their face into the scene. Otherwise the prompt asks for a
 *      random person — same chat flow, slightly cheaper, no identity loss
 *      risk.
 *   3. Dream titles come from rows the user owns (repository scoped by
 *      `userId`). Any id they didn't own is silently dropped; we fail if that
 *      leaves zero titles.
 *   4. Prompt is assembled server-side from those titles + style. No caller
 *      text ever reaches Gemini — that's the abuse boundary.
 */
export const generateDreamBoard = async (
  cmd: GenerateDreamBoardCmd & { skipPhoto?: boolean },
  ctx: {
    userId: string;
    dreams: DreamRepository;
    dreamBoards: DreamBoardRepository;
    userPhotos: UserPhotoRepository;
    imageClient: DreamBoardImageClient;
  },
): Promise<DreamBoard> => {
  const parsed = generateDreamBoardSchema.parse(cmd);
  const skipPhoto = cmd.skipPhoto ?? false;

  const limit = getDailyLimit();
  const usedToday = await ctx.dreamBoards.countCreatedSince(
    ctx.userId,
    startOfUtcDay(),
  );
  if (usedToday >= limit) throw new DailyQuotaExceededError(limit);

  const allDreams = await ctx.dreams.listByUser(ctx.userId);
  const selected = parsed.dreamIds
    .map((id) => allDreams.find((d) => d.id === id))
    .filter((d): d is (typeof allDreams)[number] => !!d);
  if (selected.length === 0) {
    throw new ValidationError("None of the selected dreams were found.");
  }

  // Fetch photo only when we're actually going to use it.
  let photoInput: { bytes: Uint8Array; mimeType: string } | undefined;
  if (!skipPhoto) {
    const photo = await ctx.userPhotos.findByUser(ctx.userId);
    if (photo) {
      const bytes = await ctx.userPhotos.downloadImage(photo.storagePath);
      photoInput = { bytes, mimeType: "image/jpeg" };
    }
  }

  const png = await ctx.imageClient.generate({
    dreamTitles: selected.map((d) => d.title),
    style: parsed.style,
    photo: photoInput,
  });

  const boardId = crypto.randomUUID();
  const storagePath = await ctx.dreamBoards.uploadImage(
    ctx.userId,
    boardId,
    png,
  );

  const board = newDreamBoard(
    {
      id: boardId,
      dreamIds: selected.map((d) => d.id),
      style: parsed.style,
      storagePath,
    },
    ctx.userId,
  );
  await ctx.dreamBoards.save(board);
  return board;
};
