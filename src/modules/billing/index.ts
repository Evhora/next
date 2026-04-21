/**
 * Public surface of the Billing module. Code outside `src/modules/billing/**`
 * should import from here — never reach into `domain/`, `application/`, or
 * `infrastructure/` directly.
 */

// Use cases
export { cancelSubscription } from "./application/cancel-subscription";
export { changePlan } from "./application/change-plan";
export { getCurrentSubscription } from "./application/get-current-subscription";
export { handleProviderWebhook } from "./application/handle-provider-webhook";
export { listInvoices } from "./application/list-invoices";
export { resumeSubscription } from "./application/resume-subscription";
export { startCheckout } from "./application/start-checkout";
export { updatePaymentMethod } from "./application/update-payment-method";

// Domain types
export type { BillingRepository } from "./domain/billing-repository";
export type { Customer } from "./domain/customer";
export { invoiceStatusToString } from "./domain/invoice";
export type { Invoice } from "./domain/invoice";
export { SUBSCRIPTION_STATUS_TRANSLATION_KEYS } from "./domain/labels";
export type { PaymentProvider } from "./domain/payment-provider";
export type { Price } from "./domain/price";
export { productHighlighted, productTierOrder } from "./domain/product";
export type { Product } from "./domain/product";
export {
  PaymentProvider as BillingProvider,
  providerFromString,
  providerToName,
  providerToString,
} from "./domain/provider";
export {
  hasActiveAccess,
  isTrialing,
  Subscription_SubscriptionStatus,
  subscriptionStatusToName,
  subscriptionStatusToString,
} from "./domain/subscription";
export type { Subscription } from "./domain/subscription";

// Errors
export {
  CheckoutError,
  CustomerNotFoundError,
  SubscriptionNotFoundError,
  WebhookError,
} from "./domain/errors";

// UI
export { BillingSummary } from "./ui/billing-summary";
export type { BillingSummaryData } from "./ui/billing-summary";
export { CancelSubscriptionButton } from "./ui/cancel-subscription-button";
export { ChangePlanDialog } from "./ui/change-plan-dialog";
export type { ChangePlanOption } from "./ui/change-plan-dialog";
export { InvoiceList } from "./ui/invoice-list";
export { PricingCard } from "./ui/pricing-card";
export type { PricingPlan } from "./ui/pricing-card";
export { ResumeSubscriptionButton } from "./ui/resume-subscription-button";
export { SubscribeButton } from "./ui/subscribe-button";
export { UpdatePaymentMethodDialog } from "./ui/update-payment-method-dialog";
