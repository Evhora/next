"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ComponentPropsWithoutRef, useState } from "react";

interface ForgotPasswordFormProps extends ComponentPropsWithoutRef<"div"> {
  redirectTo?: string;
}

export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {t("pages.auth.forgotPassword.checkEmail")}
            </CardTitle>
            <CardDescription>
              {t("pages.auth.forgotPassword.instructionsSent")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("pages.auth.forgotPassword.emailSentMessage")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t("pages.auth.forgotPassword.title")}
            </CardTitle>
            <CardDescription>
              {t("pages.auth.forgotPassword.description")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">
                    {t("pages.auth.forgotPassword.email")}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t(
                        "pages.auth.forgotPassword.emailPlaceholder"
                      )}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FieldContent>
                </Field>

                {error && <FieldError>{error}</FieldError>}

                <Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? t("common.loading")
                      : t("pages.auth.forgotPassword.sendResetLink")}
                  </Button>

                  <FieldDescription className="text-center">
                    {t("pages.auth.login.dontHaveAccount")}{" "}
                    <Link
                      href="/auth/login"
                      className="underline underline-offset-4"
                    >
                      {t("pages.auth.login.signIn")}
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
