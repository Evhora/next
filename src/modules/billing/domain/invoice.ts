import { create } from "@bufbuild/protobuf";
import { timestampNow } from "@bufbuild/protobuf/wkt";

import {
  type Invoice,
  Invoice_InvoiceStatus,
  type Invoice_StatusChange,
  Invoice_StatusChangeSchema,
  InvoiceSchema,
} from "@/modules/billing/proto/v1/invoice_pb";

import { BillingProvider } from "./provider";

export { Invoice_InvoiceStatus, Invoice_StatusChangeSchema, InvoiceSchema };
export type { Invoice, Invoice_StatusChange };

/**
 * Short lowercase label for the `status` column (Stripe vocabulary). Stable
 * across migrations and what queries filter on.
 */
export const invoiceStatusToString = (
  status: Invoice_InvoiceStatus,
): string | null => {
  switch (status) {
    case Invoice_InvoiceStatus.DRAFT:
      return "draft";
    case Invoice_InvoiceStatus.OPEN:
      return "open";
    case Invoice_InvoiceStatus.PAID:
      return "paid";
    case Invoice_InvoiceStatus.UNCOLLECTIBLE:
      return "uncollectible";
    case Invoice_InvoiceStatus.VOID:
      return "void";
    default:
      return null;
  }
};

export const invoiceStatusFromString = (
  value: string | null,
): Invoice_InvoiceStatus => {
  switch (value) {
    case "draft":
      return Invoice_InvoiceStatus.DRAFT;
    case "open":
      return Invoice_InvoiceStatus.OPEN;
    case "paid":
      return Invoice_InvoiceStatus.PAID;
    case "uncollectible":
      return Invoice_InvoiceStatus.UNCOLLECTIBLE;
    case "void":
      return Invoice_InvoiceStatus.VOID;
    default:
      return Invoice_InvoiceStatus.UNSPECIFIED;
  }
};

/**
 * Fully-qualified proto enum name for the `status_name` column. Mirrors
 * `<EnumName>` in the .proto exactly — e.g. `INVOICE_STATUS_DRAFT`.
 */
export const invoiceStatusToName = (status: Invoice_InvoiceStatus): string => {
  switch (status) {
    case Invoice_InvoiceStatus.DRAFT:
      return "INVOICE_STATUS_DRAFT";
    case Invoice_InvoiceStatus.OPEN:
      return "INVOICE_STATUS_OPEN";
    case Invoice_InvoiceStatus.PAID:
      return "INVOICE_STATUS_PAID";
    case Invoice_InvoiceStatus.UNCOLLECTIBLE:
      return "INVOICE_STATUS_UNCOLLECTIBLE";
    case Invoice_InvoiceStatus.VOID:
      return "INVOICE_STATUS_VOID";
    default:
      return "INVOICE_STATUS_UNSPECIFIED";
  }
};

export const isInvoicePaid = (invoice: Invoice): boolean =>
  invoice.status === Invoice_InvoiceStatus.PAID;

export interface NewInvoiceCmd {
  id: string;
  provider: BillingProvider;
  userId: string;
  subscriptionId: string;
  status: Invoice_InvoiceStatus;
  amountDue: bigint;
  amountPaid: bigint;
  currency: string;
  number: string;
  hostedInvoiceUrl: string;
  invoicePdf: string;
  createdAtMs: number;
}

export function newInvoice(cmd: NewInvoiceCmd): Invoice {
  const now = timestampNow();
  const createdAt = timestampNow();
  createdAt.seconds = BigInt(Math.floor(cmd.createdAtMs / 1000));
  createdAt.nanos = 0;

  return create(InvoiceSchema, {
    id: cmd.id,
    provider: cmd.provider,
    userId: cmd.userId,
    subscriptionId: cmd.subscriptionId,
    status: cmd.status,
    amountDue: cmd.amountDue,
    amountPaid: cmd.amountPaid,
    currency: cmd.currency,
    number: cmd.number,
    hostedInvoiceUrl: cmd.hostedInvoiceUrl,
    invoicePdf: cmd.invoicePdf,
    createdAt,
    updatedAt: now,
  });
}

/**
 * Merge a freshly-derived invoice with its prior state so the `statusHistory`
 * log carries over and gains a new entry whenever the status actually
 * transitioned. See `mergeSubscriptionHistory` for the mirrored semantics.
 */
export function mergeInvoiceHistory(
  next: Invoice,
  prior: Invoice | null,
): Invoice {
  const priorHistory = prior?.statusHistory ?? [];
  const lastStatus = priorHistory.at(-1)?.status ?? prior?.status;

  if (prior && lastStatus === next.status) {
    return { ...next, statusHistory: priorHistory };
  }

  const entry = create(Invoice_StatusChangeSchema, {
    status: next.status,
    changedAt: timestampNow(),
  });
  return { ...next, statusHistory: [...priorHistory, entry] };
}
