import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { buildCtx } from "@/shared/context";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UnauthorizedError } from "@/shared/errors";

interface Props {
  children: React.ReactNode;
}

async function DashboardLayoutContent({ children }: Props) {
  let ctx;
  try {
    ctx = await buildCtx();
  } catch (e) {
    if (e instanceof UnauthorizedError) redirect("/auth/login");
    throw e;
  }

  return (
    <DashboardShell user={{ name: ctx.user.displayName, email: ctx.user.email ?? "", avatar: ctx.user.avatarUrl ?? "" }}>
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({ children }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
