"use client";

import { useTranslations } from "next-intl";
import { useTransition, useState } from "react";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { createClient } from "@/shared/supabase/client";

interface Props {
  initialPhone?: string;
}

export function ChangePhoneForm({ initialPhone = "" }: Props) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isDirty = phoneNumber !== initialPhone;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({
          data: { phone_number: phoneNumber.trim() || null },
        });
        if (updateError) throw updateError;
        setSuccess(true);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : t("pages.account.changePhone.error"),
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.account.changePhone.title")}</CardTitle>
        <CardDescription>{t("pages.account.changePhone.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">{t("pages.account.changePhone.phoneNumber")}</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+55 (11) 99999-9999"
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
              {t("pages.account.changePhone.success")}
            </div>
          )}
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? t("pages.account.changePhone.updating") : t("pages.account.changePhone.update")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
