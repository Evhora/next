import { getTranslations } from "next-intl/server";

import type { AppContext } from "@/shared/context";

import { PersonalInfoSection } from "./personal-info-section";
import { ProfileHeader } from "./profile-header";
import { SecuritySection } from "./security-section";

interface Props {
  ctx: AppContext;
}

export async function AccountPage({ ctx }: Props) {
  const t = await getTranslations();

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("pages.account.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("pages.account.description")}
          </p>
        </div>

        <ProfileHeader ctx={ctx} />
        <PersonalInfoSection ctx={ctx} />
        <SecuritySection />
      </div>
    </div>
  );
}
