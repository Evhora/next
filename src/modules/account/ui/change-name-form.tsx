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

import { updateProfileAction } from "./actions";

interface Props {
  initialFirstName?: string;
  initialLastName?: string;
}

export function ChangeNameForm({ initialFirstName = "", initialLastName = "" }: Props) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isDirty = firstName !== initialFirstName || lastName !== initialLastName;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await updateProfileAction(new FormData(form));
      if (result.ok) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.account.changeName.title")}</CardTitle>
        <CardDescription>{t("pages.account.changeName.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("pages.account.changeName.firstName")}</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("pages.account.changeName.lastName")}</Label>
              <Input
                id="lastName"
                name="lastName"
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
              {t("pages.account.changeName.success")}
            </div>
          )}
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? t("pages.account.changeName.updating") : t("pages.account.changeName.update")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
