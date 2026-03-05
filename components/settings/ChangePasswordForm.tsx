"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ChangePasswordForm() {
  const t = useTranslations();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError(t("pages.auth.signUp.passwordsDoNotMatch"));
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError(t("pages.settings.changePassword.passwordMinLength"));
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Update password using Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t("pages.settings.changePassword.error"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.settings.changePassword.title")}</CardTitle>
        <CardDescription>
          {t("pages.settings.changePassword.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {t("pages.settings.changePassword.newPassword")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t("pages.settings.changePassword.confirmPassword")}
            </Label>
            <Input
              id="confirmPassword"
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
              {t("pages.settings.changePassword.success")}
            </div>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t("pages.settings.changePassword.updating")
              : t("pages.settings.changePassword.update")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
