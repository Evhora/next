import type { DreamArcheologySession } from "../proto/v1/session_pb";

export interface SessionRepository {
  save(session: DreamArcheologySession): Promise<void>;
  update(session: DreamArcheologySession): Promise<void>;
  findById(id: string): Promise<DreamArcheologySession | undefined>;
  findActiveByUserId(userId: string): Promise<DreamArcheologySession | undefined>;
  listForUser(userId: string): Promise<DreamArcheologySession[]>;
}
