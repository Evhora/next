import { create } from "@bufbuild/protobuf";
import { timestampNow } from "@bufbuild/protobuf/wkt";

import {
  type Customer,
  CustomerSchema,
} from "@/modules/billing/proto/v1/customer_pb";

import { BillingProvider } from "./provider";

export { CustomerSchema };
export type { Customer };

export interface NewCustomerCmd {
  id?: string;
  userId: string;
  provider: BillingProvider;
  providerCustomerId: string;
}

export function newCustomer(cmd: NewCustomerCmd): Customer {
  const now = timestampNow();
  return create(CustomerSchema, {
    id: cmd.id ?? "",
    userId: cmd.userId,
    provider: cmd.provider,
    providerCustomerId: cmd.providerCustomerId,
    createdAt: now,
    updatedAt: now,
  });
}
