export const BILLING_CURRENCY = "brl";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function getCheckoutSuccessUrl(): string {
  return `${getSiteUrl()}/dashboard?checkout=success`;
}

export function getCheckoutCancelUrl(): string {
  return `${getSiteUrl()}/pricing?checkout=cancelled`;
}
