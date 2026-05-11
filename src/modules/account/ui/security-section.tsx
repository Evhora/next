import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { ChangePasswordForm } from "./change-password-form";
import { SignOutEverywhereButton } from "./sign-out-everywhere-button";

export async function SecuritySection() {
  const t = await getTranslations();

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">{t("pages.account.sections.security")}</h3>
      <div className="space-y-4">
        <ChangePasswordForm />
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.account.security.sessionsTitle")}</CardTitle>
            <CardDescription>{t("pages.account.security.sessionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <SignOutEverywhereButton />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
