import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Returns a singleton Stripe SDK client. Server-only — never import from
 * client components.
 */
export function getStripe(): Stripe {
  if (cached) return cached;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  cached = new Stripe(key, {
    appInfo: {
      name: "evhora",
      url: "https://evhora.app",
    },
  });
  return cached;
}
