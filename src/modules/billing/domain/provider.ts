import { BillingProvider } from "@/modules/shared/proto/v1/billing-provider_pb";

export { BillingProvider };

/**
 * Short lowercase label for the `provider` TEXT column. Stable identifiers
 * used in queries/filters, kept separate from the fully-qualified proto enum
 * names written to `provider_name` (see `providerToName`).
 */
export const providerToString = (provider: BillingProvider): string => {
  switch (provider) {
    case BillingProvider.STRIPE:
      return "stripe";
    default:
      return "unspecified";
  }
};

export const providerFromString = (value: string | null): BillingProvider => {
  switch (value) {
    case "stripe":
      return BillingProvider.STRIPE;
    default:
      return BillingProvider.UNSPECIFIED;
  }
};

/**
 * Fully-qualified proto enum name for the `provider_name` column. Mirrors
 * `<EnumName>` in the .proto exactly — e.g. `BILLING_PROVIDER_STRIPE`.
 */
export const providerToName = (provider: BillingProvider): string => {
  switch (provider) {
    case BillingProvider.STRIPE:
      return "BILLING_PROVIDER_STRIPE";
    default:
      return "BILLING_PROVIDER_UNSPECIFIED";
  }
};
