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

import { ActionRepository } from "@/modules/actions/domain/ActionRepository";
import { SupabaseActionRepository } from "@/modules/actions/infrastructure/SupabaseActionRepository";
import { DreamRepository } from "@/modules/dreams/domain/DreamRepository";
import { SupabaseDreamRepository } from "@/modules/dreams/infrastructure/SupabaseDreamRepository";
import { SentenceRepository } from "@/modules/dashboard/domain/SentenceRepository";
import { SupabaseSentenceRepository } from "@/modules/dashboard/infrastructure/SupabaseSentenceRepository";

import { UnauthorizedError } from "./errors";
import { createClient } from "./supabase/server";

export interface CurrentUser {
  id: string;
  email: string | null;
  displayName: string;
}

export interface AppContext {
  user: CurrentUser;
  /** Convenience alias for `user.id` — most use cases only need this. */
  userId: string;
  dreams: DreamRepository;
  actions: ActionRepository;
  sentences: SentenceRepository;
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
    user: { id: user.id, email: user.email ?? null, displayName },
    userId: user.id,
    dreams: new SupabaseDreamRepository(supabase),
    actions: new SupabaseActionRepository(supabase),
    sentences: new SupabaseSentenceRepository(supabase),
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
