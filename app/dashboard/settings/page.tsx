import { ChangeNameForm } from "@/components/settings/ChangeNameForm";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { ChangePhoneForm } from "@/components/settings/ChangePhoneForm";

export default function SettingsPage() {
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
