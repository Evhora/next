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

import { updatePasswordAction } from "./actions";

export function ChangePasswordForm() {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await updatePasswordAction(new FormData(form));
      if (result.ok) {
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.account.changePassword.title")}</CardTitle>
        <CardDescription>{t("pages.account.changePassword.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("pages.account.changePassword.newPassword")}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("pages.account.changePassword.confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
              {t("pages.account.changePassword.success")}
            </div>
          )}
          <Button type="submit" disabled={isPending || !newPassword || !confirmPassword}>
            {isPending ? t("pages.account.changePassword.updating") : t("pages.account.changePassword.update")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
