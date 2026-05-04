import { create } from "@bufbuild/protobuf";
import { timestampNow } from "@bufbuild/protobuf/wkt";

import {
  type UserPhoto,
  UserPhotoSchema,
} from "@/modules/dream_board/proto/v1/user_photo_pb";

/**
 * The reference photo used to fuse the user's face into generated boards.
 * One per user — replacing simply bumps the version and updatedAt.
 */

export { UserPhotoSchema };
export type { UserPhoto };

export function newUserPhoto(userId: string, storagePath: string): UserPhoto {
  if (!storagePath.trim()) throw new Error("Storage path is required.");
  const now = timestampNow();
  return create(UserPhotoSchema, {
    userId,
    storagePath,
    version: 1n,
    createdAt: now,
    updatedAt: now,
  });
}

export function userPhotoReplaced(
  prev: UserPhoto,
  storagePath: string,
): UserPhoto {
  return create(UserPhotoSchema, {
    ...prev,
    storagePath,
    version: prev.version + 1n,
    updatedAt: timestampNow(),
  });
}
