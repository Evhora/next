import type { BillingRepository } from "@/modules/billing/domain/billing-repository";
import { Subscription_SubscriptionStatus } from "@/modules/billing/domain/subscription";

import { markSynthesizing, setCandidates } from "../domain/session";
import {
  SessionNotFoundError,
  SessionAlreadyCompletedError,
  QuotaExceededError,
} from "../domain/errors";
import type { LlmClient } from "../domain/llm-client";
import type { SessionRepository } from "../domain/session-repository";
import type { DreamArcheologySession, DreamCandidate } from "../proto/v1/session_pb";
import { SessionStatus } from "../proto/v1/session_pb";
import type { SynthesizeCandidatesCmd } from "./schemas";

export interface SynthesizeCandidatesResult {
  session: DreamArcheologySession;
  candidates: DreamCandidate[];
}

export const synthesizeCandidates = async (
  cmd: SynthesizeCandidatesCmd,
  ctx: {
    userId: string;
    discoverySessions: SessionRepository;
    discoveryLlm: LlmClient;
    billing: BillingRepository;
  },
): Promise<SynthesizeCandidatesResult> => {
  const session = await ctx.discoverySessions.findById(cmd.sessionId);
  if (!session) throw new SessionNotFoundError();
  if (session.status === SessionStatus.COMPLETED) {
    throw new SessionAlreadyCompletedError();
  }

  const subscription = await ctx.billing.getActiveSubscriptionForUser(ctx.userId);
  const isPaid =
    subscription?.status === Subscription_SubscriptionStatus.ACTIVE ||
    subscription?.status === Subscription_SubscriptionStatus.TRIALING;
  if (!isPaid) throw new QuotaExceededError();

  let updated = markSynthesizing(session);
  await ctx.discoverySessions.update(updated);

  const candidates = await ctx.discoveryLlm.synthesize(updated.answers);
  updated = setCandidates(updated, candidates);
  await ctx.discoverySessions.update(updated);

  return { session: updated, candidates };
};
