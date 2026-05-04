import { ValidationError } from "@/shared/errors";

import { newUserPhoto, userPhotoReplaced, type UserPhoto } from "../domain/user-photo";
import type { UserPhotoRepository } from "../domain/user-photo-repository";

import { uploadUserPhotoSchema, type UploadUserPhotoCmd } from "./schemas";

const MAX_DECODED_BYTES = 2 * 1024 * 1024; // 2 MB after client-side downscale

/**
 * Upload (or replace) the user's reference photo. Client is expected to have
 * already resized to ≤768px longest edge — we re-check the decoded size on
 * the server so a malicious client can't push a 50 MB payload.
 */
export const uploadUserPhoto = async (
  cmd: UploadUserPhotoCmd,
  ctx: { userId: string; userPhotos: UserPhotoRepository },
): Promise<UserPhoto> => {
  const parsed = uploadUserPhotoSchema.parse(cmd);

  const base64 = parsed.dataUrl.slice(parsed.dataUrl.indexOf(",") + 1);
  const bytes = Buffer.from(base64, "base64");
  if (bytes.byteLength > MAX_DECODED_BYTES) {
    throw new ValidationError(
      "Photo too large after decoding. Try a smaller image.",
    );
  }

  const storagePath = await ctx.userPhotos.uploadImage(
    ctx.userId,
    new Uint8Array(bytes),
  );

  const existing = await ctx.userPhotos.findByUser(ctx.userId);
  if (existing) {
    const next = userPhotoReplaced(existing, storagePath);
    await ctx.userPhotos.update(next);
    return next;
  }

  const created = newUserPhoto(ctx.userId, storagePath);
  await ctx.userPhotos.save(created);
  return created;
};
