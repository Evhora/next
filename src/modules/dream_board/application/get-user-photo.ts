import type { UserPhotoRepository } from "../domain/user-photo-repository";

export interface UserPhotoView {
  url: string;
  updatedAt: Date | undefined;
}

/**
 * Fetch the current reference photo as a signed URL the browser can render.
 * Returns null if the user hasn't uploaded one yet.
 */
export const getUserPhoto = async (ctx: {
  userId: string;
  userPhotos: UserPhotoRepository;
}): Promise<UserPhotoView | null> => {
  const photo = await ctx.userPhotos.findByUser(ctx.userId);
  if (!photo) return null;
  const url = await ctx.userPhotos.signedUrlFor(photo.storagePath);
  return {
    url,
    updatedAt: photo.updatedAt
      ? new Date(Number(photo.updatedAt.seconds) * 1000)
      : undefined,
  };
};
