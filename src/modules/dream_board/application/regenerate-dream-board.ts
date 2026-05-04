import type { DreamRepository } from "@/modules/dreams/domain/dream-repository";
import { ValidationError } from "@/shared/errors";

import { dreamBoardWithNewImage, type DreamBoard } from "../domain/dream-board";
import type { DreamBoardRepository } from "../domain/dream-board-repository";
import {
  DailyQuotaExceededError,
  DreamBoardNotFoundError,
  UserPhotoRequiredError,
} from "../domain/errors";
import type { UserPhotoRepository } from "../domain/user-photo-repository";

import type { DreamBoardImageClient } from "./generate-dream-board";
import { getDailyLimit, startOfUtcDay } from "./get-quota";
import {
  regenerateDreamBoardSchema,
  type RegenerateDreamBoardCmd,
} from "./schemas";

/**
 * Re-roll an existing board with the same dreams + style. Counts against the
 * daily cap (each Gemini call costs money). Keeps the same row id but
 * overwrites the storage object — old PNG is deleted after the new one is
 * safely up so a mid-flight failure never leaves the row orphaned.
 */
export const regenerateDreamBoard = async (
  cmd: RegenerateDreamBoardCmd,
  ctx: {
    userId: string;
    dreams: DreamRepository;
    dreamBoards: DreamBoardRepository;
    userPhotos: UserPhotoRepository;
    imageClient: DreamBoardImageClient;
  },
): Promise<DreamBoard> => {
  const parsed = regenerateDreamBoardSchema.parse(cmd);

  const limit = getDailyLimit();
  const usedToday = await ctx.dreamBoards.countCreatedSince(
    ctx.userId,
    startOfUtcDay(),
  );
  if (usedToday >= limit) throw new DailyQuotaExceededError(limit);

  const existing = await ctx.dreamBoards.findByIdForUser(parsed.id, ctx.userId);
  if (!existing) throw new DreamBoardNotFoundError();

  const photo = await ctx.userPhotos.findByUser(ctx.userId);
  if (!photo) throw new UserPhotoRequiredError();

  const allDreams = await ctx.dreams.listByUser(ctx.userId);
  const selected = existing.dreamIds
    .map((id) => allDreams.find((d) => d.id === id))
    .filter((d): d is (typeof allDreams)[number] => !!d);
  if (selected.length === 0) {
    throw new ValidationError(
      "The dreams referenced by this board are no longer available.",
    );
  }

  const photoBytes = await ctx.userPhotos.downloadImage(photo.storagePath);
  const png = await ctx.imageClient.generate({
    dreamTitles: selected.map((d) => d.title),
    style: existing.style,
    photo: { bytes: photoBytes, mimeType: "image/jpeg" },
  });

  const oldPath = existing.storagePath;
  const newPath = await ctx.dreamBoards.uploadImage(
    ctx.userId,
    existing.id,
    png,
  );

  const next = dreamBoardWithNewImage(existing, newPath);
  await ctx.dreamBoards.update(next);

  if (oldPath && oldPath !== newPath) {
    await ctx.dreamBoards.deleteImage(oldPath).catch(() => {
      /* best-effort cleanup */
    });
  }
  return next;
};
