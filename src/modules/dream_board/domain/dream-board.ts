import { create } from "@bufbuild/protobuf";
import { timestampNow } from "@bufbuild/protobuf/wkt";

import {
  type DreamBoard,
  DreamBoardSchema,
  DreamBoard_DreamBoardStyle,
} from "@/modules/dream_board/proto/v1/dream_board_pb";

/**
 * Domain surface for the DreamBoard entity. Same shape as the Dreams module:
 * the proto type is the domain type, invariants live in free factories, and
 * mutators return new values with a bumped `version` and refreshed
 * `updated_at`.
 */

export { DreamBoardSchema, DreamBoard_DreamBoardStyle };
export type { DreamBoard };

export interface NewDreamBoardCmd {
  id: string;
  dreamIds: string[];
  style: DreamBoard_DreamBoardStyle;
  storagePath: string;
}

export function newDreamBoard(
  cmd: NewDreamBoardCmd,
  userId: string,
): DreamBoard {
  if (cmd.dreamIds.length === 0) {
    throw new Error("At least one dream is required.");
  }
  if (!cmd.storagePath.trim()) {
    throw new Error("Storage path is required.");
  }

  const now = timestampNow();
  return create(DreamBoardSchema, {
    id: cmd.id,
    userId,
    dreamIds: cmd.dreamIds,
    style: cmd.style,
    storagePath: cmd.storagePath,
    version: 1n,
    createdAt: now,
    updatedAt: now,
  });
}

export function dreamBoardWithNewImage(
  board: DreamBoard,
  storagePath: string,
): DreamBoard {
  return create(DreamBoardSchema, {
    ...board,
    storagePath,
    version: board.version + 1n,
    updatedAt: timestampNow(),
  });
}

export function softDeleteDreamBoard(board: DreamBoard): DreamBoard {
  const now = timestampNow();
  return create(DreamBoardSchema, {
    ...board,
    version: board.version + 1n,
    updatedAt: now,
    deletedAt: now,
  });
}
