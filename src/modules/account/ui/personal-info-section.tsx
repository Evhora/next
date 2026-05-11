import { getTranslations } from "next-intl/server";

import type { AppContext } from "@/shared/context";

import { AvatarUploadForm } from "./avatar-upload-form";
import { ChangeNameForm } from "./change-name-form";
import { ChangePhoneForm } from "./change-phone-form";

interface Props {
  ctx: AppContext;
}

export async function PersonalInfoSection({ ctx }: Props) {
  const t = await getTranslations();

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">{t("pages.account.sections.personalInfo")}</h3>
      <div className="space-y-4">
        <AvatarUploadForm
          userId={ctx.userId}
          displayName={ctx.user.displayName}
          currentAvatarUrl={ctx.user.avatarUrl}
        />
        <ChangeNameForm
          initialFirstName={ctx.user.displayName.split(" ")[0]}
          initialLastName={ctx.user.displayName.split(" ").slice(1).join(" ")}
        />
        <ChangePhoneForm />
      </div>
    </section>
  );
}
