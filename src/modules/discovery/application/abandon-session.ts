import { create } from "@bufbuild/protobuf";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";

import type { SessionRepository } from "../domain/session-repository";
import {
  DreamArcheologySessionSchema,
  SessionStatus,
  type DreamArcheologySession,
} from "../proto/v1/session_pb";

export const abandonSession = async (ctx: {
  userId: string;
  discoverySessions: SessionRepository;
}): Promise<void> => {
  const session = await ctx.discoverySessions.findActiveByUserId(ctx.userId);
  if (!session) return;
  const updated: DreamArcheologySession = create(DreamArcheologySessionSchema, {
    ...session,
    status: SessionStatus.ABANDONED,
    version: session.version + 1n,
    updatedAt: timestampFromDate(new Date()),
  });
  await ctx.discoverySessions.update(updated);
};
