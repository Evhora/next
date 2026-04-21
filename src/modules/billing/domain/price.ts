import { create } from "@bufbuild/protobuf";
import { timestampNow } from "@bufbuild/protobuf/wkt";

import { type Price, PriceSchema } from "@/modules/billing/proto/v1/price_pb";

import { BillingProvider } from "./provider";

export { PriceSchema };
export type { Price };

export interface NewPriceCmd {
  id: string;
  provider: BillingProvider;
  productId: string;
  active: boolean;
  currency: string;
  unitAmount?: bigint;
  interval?: string;
  allowedUserIds?: string[];
}

export function newPrice(cmd: NewPriceCmd): Price {
  const now = timestampNow();
  return create(PriceSchema, {
    id: cmd.id,
    provider: cmd.provider,
    productId: cmd.productId,
    active: cmd.active,
    currency: cmd.currency,
    unitAmount: cmd.unitAmount,
    interval: cmd.interval,
    allowedUserIds: cmd.allowedUserIds ?? [],
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Visibility gate for prices restricted to a user allowlist.
 *
 * - Empty `allowedUserIds` → public, visible to everyone (incl. anonymous).
 * - Non-empty → visible only to users whose id is on the list. Anonymous
 *   visitors (no `userId`) always fail the check for restricted prices.
 *
 * The UI filters pricing cards through this helper and `start-checkout`
 * enforces it again server-side as a defence-in-depth guard.
 */
export const isPriceVisibleToUser = (
  price: Price,
  userId: string | null,
): boolean => {
  if (price.allowedUserIds.length === 0) return true;
  return userId != null && price.allowedUserIds.includes(userId);
};
