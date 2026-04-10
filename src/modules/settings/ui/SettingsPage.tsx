import { getTranslations } from "next-intl/server";

import { ChangeNameForm } from "./ChangeNameForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ChangePhoneForm } from "./ChangePhoneForm";

/**
 * /dashboard/settings — Server Component shell. The forms are client islands
 * (each owns its own state, validation and Supabase call) so the page itself
 * just lays them out.
 */
export async function SettingsPage() {
  const t = await getTranslations();

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("pages.settings.title")}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t("pages.settings.description")}
          </p>
        </div>

        <div className="space-y-6">
          <ChangeNameForm />
          <ChangePhoneForm />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
