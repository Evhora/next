/**
 * Composition root: builds the per-request context that use cases consume.
 *
 * `buildCtx()` is the *only* place that wires Supabase clients to repositories.
 * Use cases never import Supabase or repository implementations directly — they
 * receive an AppContext and depend on the interfaces it carries.
 *
 * This is the lightest possible "DI": one async function, no container, no
 * decorators, no scopes. If a use case needs a new repository, add a field
 * here and the rest of the system stays untouched.
 */

import { cache } from "react";

import { ActionRepository } from "@/modules/actions/domain/action-repository";
import { SupabaseActionRepository } from "@/modules/actions/infrastructure/supabase-action-repository";
import { BillingRepository } from "@/modules/billing/domain/billing-repository";
import { PaymentProvider } from "@/modules/billing/domain/payment-provider";
import { StripePaymentProvider } from "@/modules/billing/infrastructure/stripe-payment-provider";
import { SupabaseBillingRepository } from "@/modules/billing/infrastructure/supabase-billing-repository";
import { SentenceRepository } from "@/modules/dashboard/domain/sentence-repository";
import { SupabaseSentenceRepository } from "@/modules/dashboard/infrastructure/supabase-sentence-repository";
import { LlmClient } from "@/modules/discovery/domain/llm-client";
import { SessionRepository } from "@/modules/discovery/domain/session-repository";
import { VoiceTranscriber } from "@/modules/discovery/domain/voice-transcriber";
import { NoopVoiceTranscriber } from "@/modules/discovery/infrastructure/noop-voice-transcriber";
import { OpenRouterLlmClient } from "@/modules/discovery/infrastructure/openrouter-llm-client";
import { SupabaseSessionRepository } from "@/modules/discovery/infrastructure/supabase-session-repository";
import { DreamBoardImageClient } from "@/modules/dream_board/application/generate-dream-board";
import { ConversationRepository } from "@/modules/dream_board/domain/conversation-repository";
import { DreamBoardRepository } from "@/modules/dream_board/domain/dream-board-repository";
import { UserPhotoRepository } from "@/modules/dream_board/domain/user-photo-repository";
import { GeminiImageClient } from "@/modules/dream_board/infrastructure/gemini-image-client";
import { SupabaseConversationRepository } from "@/modules/dream_board/infrastructure/supabase-conversation-repository";
import { SupabaseDreamBoardRepository } from "@/modules/dream_board/infrastructure/supabase-dream-board-repository";
import { SupabaseUserPhotoRepository } from "@/modules/dream_board/infrastructure/supabase-user-photo-repository";
import { DreamRepository } from "@/modules/dreams/domain/dream-repository";
import { SupabaseDreamRepository } from "@/modules/dreams/infrastructure/supabase-dream-repository";

import { UnauthorizedError } from "./errors";
import { createClient } from "./supabase/server";

export interface CurrentUser {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
}

export interface AppContext {
  user: CurrentUser;
  /** Convenience alias for `user.id` — most use cases only need this. */
  userId: string;
  dreams: DreamRepository;
  actions: ActionRepository;
  sentences: SentenceRepository;
  billing: BillingRepository;
  payments: PaymentProvider;
  dreamBoards: DreamBoardRepository;
  userPhotos: UserPhotoRepository;
  conversations: ConversationRepository;
  imageClient: DreamBoardImageClient;
  discoverySessions: SessionRepository;
  discoveryLlm: LlmClient;
  voiceTranscriber: VoiceTranscriber;
}

/**
 * Build the request-scoped context. React's `cache` deduplicates calls within
 * a single render, so a Server Component tree only authenticates once.
 *
 * Throws UnauthorizedError if there's no signed-in user — server actions and
 * Server Components should let this propagate to the error boundary or to
 * `redirect("/auth/login")` at their boundary.
 */
export const buildCtx = cache(async (): Promise<AppContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      displayName,
      avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    },
    userId: user.id,
    dreams: new SupabaseDreamRepository(supabase),
    actions: new SupabaseActionRepository(supabase),
    sentences: new SupabaseSentenceRepository(supabase),
    billing: new SupabaseBillingRepository(supabase),
    payments: new StripePaymentProvider(),
    dreamBoards: new SupabaseDreamBoardRepository(supabase),
    userPhotos: new SupabaseUserPhotoRepository(supabase),
    conversations: new SupabaseConversationRepository(supabase),
    imageClient: new GeminiImageClient(),
    discoverySessions: new SupabaseSessionRepository(supabase),
    discoveryLlm: new OpenRouterLlmClient(),
    voiceTranscriber: new NoopVoiceTranscriber(),
  };
});

/**
 * Variant for use in code that may run before login (auth pages). Returns
 * null instead of throwing so callers can short-circuit cleanly.
 */
export const tryBuildCtx = cache(async (): Promise<AppContext | null> => {
  try {
    return await buildCtx();
  } catch {
    return null;
  }
});
