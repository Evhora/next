"use server";

import { revalidatePath } from "next/cache";

import { buildCtx } from "@/shared/context";
import { failFromError, ok, type ActionResult } from "@/shared/result";
import { createClient } from "@/shared/supabase/server";

import { cancelSubscription } from "../application/cancel-subscription";
import { changePlan } from "../application/change-plan";
import { resumeSubscription } from "../application/resume-subscription";
import { startCheckout } from "../application/start-checkout";
import { updatePaymentMethod } from "../application/update-payment-method";
import { UnauthorizedError } from "@/shared/errors";

/**
 * Server actions for the Billing module. Each action is a thin shell:
 *
 *   1. build the request context (auth + repos + payment provider)
 *   2. invoke the use case
 *   3. revalidate the affected pages
 *   4. return a typed `ActionResult` so the client can render errors
 *
 * Actions never throw across the wire; thrown errors are converted via
 * `failFromError`. Use cases still throw — that's where the domain semantics
 * live — and this layer translates.
 */

const BILLING_PATH = "/dashboard/account/billing";

export async function startCheckoutAction(
  _prev: ActionResult<{ url: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  try {
    // `startCheckout` needs the full Supabase `User` (email/metadata) to pass
    // to Stripe — `buildCtx` exposes a trimmed `CurrentUser`. Fetch the raw
    // user here to avoid leaking Supabase types into `AppContext`.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();

    const ctx = await buildCtx();
    const result = await startCheckout(
      {
        priceId: String(formData.get("priceId") ?? ""),
        user,
      },
      { billing: ctx.billing, payments: ctx.payments },
    );
    return ok(result);
  } catch (error) {
    return failFromError(error);
  }
}

export async function cancelSubscriptionAction(): Promise<ActionResult> {
  try {
    const ctx = await buildCtx();
    await cancelSubscription(ctx);
    revalidatePath(BILLING_PATH);
    return ok(undefined);
  } catch (error) {
    return failFromError(error);
  }
}

export async function resumeSubscriptionAction(): Promise<ActionResult> {
  try {
    const ctx = await buildCtx();
    await resumeSubscription(ctx);
    revalidatePath(BILLING_PATH);
    return ok(undefined);
  } catch (error) {
    return failFromError(error);
  }
}

export async function changePlanAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const ctx = await buildCtx();
    await changePlan(
      { newPriceId: String(formData.get("priceId") ?? "") },
      ctx,
    );
    revalidatePath(BILLING_PATH);
    return ok(undefined);
  } catch (error) {
    return failFromError(error);
  }
}

export async function updatePaymentMethodAction(): Promise<
  ActionResult<{ clientSecret: string }>
> {
  try {
    const ctx = await buildCtx();
    const result = await updatePaymentMethod(ctx);
    return ok(result);
  } catch (error) {
    return failFromError(error);
  }
}
