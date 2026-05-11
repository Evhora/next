import { redirect } from "next/navigation";

import { AccountPage } from "@/modules/account";
import { buildCtx } from "@/shared/context";
import { UnauthorizedError } from "@/shared/errors";

export default async function AccountRoute() {
  let ctx;
  try {
    ctx = await buildCtx();
  } catch (e) {
    if (e instanceof UnauthorizedError) redirect("/auth/login");
    throw e;
  }

  return <AccountPage ctx={ctx} />;
}
