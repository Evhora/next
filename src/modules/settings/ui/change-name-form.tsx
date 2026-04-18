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

export function ChangeNameForm() {
  const t = useTranslations();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

        // Get full name from user metadata
        const fullName = (user.user_metadata?.full_name as string) || "";
        if (fullName) {
          const nameParts = fullName.split(" ");
          setFirstName(nameParts[0] || "");
          setLastName(nameParts.slice(1).join(" ") || "");
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

    if (!firstName.trim()) {
      setError(t("pages.auth.signUp.firstNameRequired"));
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not found");
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      // Update user metadata with full name and display name
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          display_name: fullName,
        },
      });

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t("pages.settings.changeName.error"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("pages.settings.changeName.title")}</CardTitle>
          <CardDescription>
            {t("pages.settings.changeName.description")}
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
        <CardTitle>{t("pages.settings.changeName.title")}</CardTitle>
        <CardDescription>
          {t("pages.settings.changeName.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t("pages.settings.changeName.firstName")}
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t("pages.settings.changeName.lastName")}
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
              {t("pages.settings.changeName.success")}
            </div>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t("pages.settings.changeName.updating")
              : t("pages.settings.changeName.update")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
