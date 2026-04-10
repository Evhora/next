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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { createClient } from "@/shared/supabase/client";
import { cn } from "@/shared/utils";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentPropsWithoutRef, useState } from "react";

interface SignUpFormProps extends ComponentPropsWithoutRef<"div"> {
  redirectTo?: string;
}

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError(t("pages.auth.signUp.passwordsDoNotMatch"));
      setIsLoading(false);
      return;
    }

    if (!firstName.trim()) {
      setError(t("pages.auth.signUp.firstNameRequired"));
      setIsLoading(false);
      return;
    }

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
            data: {
              full_name: fullName,
              display_name: fullName,
            },
          },
        });

      if (signUpError) throw signUpError;

      router.push("/auth/sign-up-success");
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
            {t("pages.auth.signUp.title")}
          </CardTitle>
          <CardDescription>
            {t("pages.auth.signUp.enterEmailBelow")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignUp}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullName">
                  {t("pages.auth.signUp.fullName")}
                </FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t("pages.auth.signUp.fullNamePlaceholder")}
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">
                  {t("pages.auth.signUp.email")}
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("pages.auth.signUp.emailPlaceholder")}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">
                      {t("pages.auth.signUp.password")}
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="repeat-password">
                      {t("pages.auth.signUp.confirmPassword")}
                    </FieldLabel>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  {t("pages.auth.signUp.passwordRequirements")}
                </FieldDescription>
              </Field>

              {error && <FieldError>{error}</FieldError>}

              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? t("common.loading")
                    : t("pages.auth.signUp.createAccount")}
                </Button>

                <FieldDescription className="text-center">
                  {t.rich("pages.auth.signUp.alreadyHaveAccount", {
                    signIn: (chunks) => (
                      <Link
                        href="/auth/login"
                        className="underline underline-offset-4"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        {t.rich("pages.auth.signUp.termsOfService", {
          terms: (chunks) => (
            <Link
              href="/terms-of-service"
              target="_blank"
              className="underline underline-offset-4"
            >
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link
              href="/privacy-policy"
              target="_blank"
              className="underline underline-offset-4"
            >
              {chunks}
            </Link>
          ),
        })}
      </FieldDescription>
    </div>
  );
}
