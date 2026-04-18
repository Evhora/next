import { create } from "@bufbuild/protobuf";
import { timestampNow } from "@bufbuild/protobuf/wkt";

import {
  type Dream,
  DreamSchema,
  Dream_DreamAreaOfLife,
  Dream_DreamStatus,
} from "@/modules/dreams/proto/v1/dream_pb";

/**
 * Domain surface for the Dreams bounded context. `Dream` is the generated
 * proto type; invariants live in the free factory/mutator functions below.
 * Messages are treated as immutable — mutators return new values with a
 * bumped version and refreshed `updated_at`.
 *
 * Generated names are preserved verbatim — no short aliases — so the
 * TS surface matches the `.proto` wire identifiers one-to-one.
 */

export { Dream_DreamAreaOfLife, Dream_DreamStatus, DreamSchema };
export type { Dream };

export interface NewDreamCmd {
  title: string;
  areaOfLife: Dream_DreamAreaOfLife;
  deadline: string;
  actionPlan: string;
}

export function newDream(cmd: NewDreamCmd, userId: string): Dream {
  const title = cmd.title.trim();
  if (!title) throw new Error("Dream title is required.");
  const actionPlan = cmd.actionPlan.trim();
  if (!actionPlan) throw new Error("Dream action plan is required.");

  const now = timestampNow();
  return create(DreamSchema, {
    id: crypto.randomUUID(),
    userId,
    status: Dream_DreamStatus.IN_PROGRESS,
    areaOfLife: cmd.areaOfLife,
    title,
    deadline: cmd.deadline,
    actionPlan,
    version: 1n,
    createdAt: now,
    updatedAt: now,
  });
}

export function dreamWithStatus(
  dream: Dream,
  status: Dream_DreamStatus,
): Dream {
  return create(DreamSchema, {
    ...dream,
    status,
    version: dream.version + 1n,
    updatedAt: timestampNow(),
  });
}

export function softDeleteDream(dream: Dream): Dream {
  const now = timestampNow();
  return create(DreamSchema, {
    ...dream,
    version: dream.version + 1n,
    updatedAt: now,
    deletedAt: now,
  });
}
