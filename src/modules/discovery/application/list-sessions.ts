import type { DreamArcheologySession } from "../proto/v1/session_pb";
import type { SessionRepository } from "../domain/session-repository";

export const listSessions = async (ctx: {
  userId: string;
  discoverySessions: SessionRepository;
}): Promise<DreamArcheologySession[]> =>
  ctx.discoverySessions.listForUser(ctx.userId);
