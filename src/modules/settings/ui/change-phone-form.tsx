"use client";

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
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function ChangePhoneForm() {
  const t = useTranslations();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Get phone number from user metadata
        const phoneNumber = (user.user_metadata?.phone_number as string) || "";
        if (phoneNumber) {
          setPhoneNumber(phoneNumber);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not found");
      }

      const phoneValue = phoneNumber.trim() || null;

      // Get current user metadata
      const currentMetadata = user.user_metadata || {};

      // Update user metadata with phone number
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          phone_number: phoneValue,
        },
      });

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t("pages.settings.changePhone.error"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("pages.settings.changePhone.title")}</CardTitle>
          <CardDescription>
            {t("pages.settings.changePhone.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("common.loading")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.settings.changePhone.title")}</CardTitle>
        <CardDescription>
          {t("pages.settings.changePhone.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              {t("pages.settings.changePhone.phoneNumber")}
            </Label>
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
              {t("pages.settings.changePhone.success")}
            </div>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t("pages.settings.changePhone.updating")
              : t("pages.settings.changePhone.update")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
