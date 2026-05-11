import { getTranslations } from "next-intl/server";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { getCurrentSubscription } from "@/modules/billing";
import type { AppContext } from "@/shared/context";

interface Props {
  ctx: AppContext;
}

export async function ProfileHeader({ ctx }: Props) {
  const t = await getTranslations();

  const subscription = await getCurrentSubscription({
    userId: ctx.userId,
    billing: ctx.billing,
  });

  const initials = ctx.user.displayName.slice(0, 2).toUpperCase();
  const avatarUrl = ctx.user.avatarUrl;
  const planLabel = subscription ? t("pages.account.header.subscriber") : t("pages.account.header.freePlan");

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-6 shadow-sm">
      <Avatar className="h-16 w-16">
        <AvatarImage src={avatarUrl ?? undefined} alt={ctx.user.displayName} className="object-cover" />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-semibold truncate">{ctx.user.displayName}</h2>
        <p className="text-sm text-muted-foreground truncate">{ctx.user.email}</p>
      </div>
      <Badge variant="secondary">{planLabel}</Badge>
    </div>
  );
}
