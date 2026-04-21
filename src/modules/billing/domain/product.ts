import { create } from "@bufbuild/protobuf";
import { timestampNow } from "@bufbuild/protobuf/wkt";

import {
  type Product,
  ProductSchema,
} from "@/modules/billing/proto/v1/product_pb";

import { BillingProvider } from "./provider";

export { ProductSchema };
export type { Product };

export interface NewProductCmd {
  id: string;
  provider: BillingProvider;
  active: boolean;
  name: string;
  description: string;
  features: string[];
  metadata: Record<string, string>;
}

export function newProduct(cmd: NewProductCmd): Product {
  const now = timestampNow();
  return create(ProductSchema, {
    id: cmd.id,
    provider: cmd.provider,
    active: cmd.active,
    name: cmd.name,
    description: cmd.description,
    features: cmd.features,
    metadata: cmd.metadata,
    createdAt: now,
    updatedAt: now,
  });
}

export function productHighlighted(product: Product): boolean {
  return product.metadata.highlighted === "true";
}

export function productTierOrder(product: Product): number {
  const raw = product.metadata.tier_order;
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) return n;
  }
  return Number.MAX_SAFE_INTEGER;
}
