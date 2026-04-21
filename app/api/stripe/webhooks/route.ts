import { NextResponse, type NextRequest } from "next/server";

import { handleProviderWebhook } from "@/modules/billing";
import { StripePaymentProvider } from "@/modules/billing/infrastructure/stripe-payment-provider";
import { SupabaseBillingRepository } from "@/modules/billing/infrastructure/supabase-billing-repository";
import { createClient } from "@/shared/supabase/server";

/**
 * Stripe webhook endpoint. Kept as a Route Handler (not a server action)
 * because Stripe POSTs a raw signed body that we must read verbatim.
 *
 * We bypass `buildCtx()` here — this request has no user session. Instead we
 * wire repositories directly; the repository writes use the admin client
 * internally.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  const supabase = await createClient();

  try {
    await handleProviderWebhook(body, signature, {
      billing: new SupabaseBillingRepository(supabase),
      payments: new StripePaymentProvider(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`[stripe webhook] handler failed:`, message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  return NextResponse.json({ received: true });
}
