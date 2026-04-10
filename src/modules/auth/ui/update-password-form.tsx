"use client";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { createClient } from "@/shared/supabase/client";
import { cn } from "@/shared/utils";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ComponentPropsWithoutRef, useState } from "react";

interface UpdatePasswordFormProps extends ComponentPropsWithoutRef<"div"> {
  redirectTo?: string;
}

export function UpdatePasswordForm({
  className,
  ...props
}: UpdatePasswordFormProps) {
  const t = useTranslations();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {t("pages.auth.updatePassword.title")}
          </CardTitle>
          <CardDescription>
            {t("pages.auth.updatePassword.description")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">
                  {t("pages.auth.updatePassword.newPassword")}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("pages.auth.updatePassword.newPassword")}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FieldContent>
              </Field>

              {error && <FieldError>{error}</FieldError>}

              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? t("common.loading")
                    : t("pages.auth.updatePassword.update")}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
