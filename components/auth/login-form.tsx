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
import { useRouter } from "next/navigation";
import { ComponentPropsWithoutRef, useState } from "react";

interface Props extends ComponentPropsWithoutRef<"div"> {
  redirectTo?: string;
}

export function LoginForm({ className, ...props }: Props) {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Redirect to dashboard after successful login
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {t("pages.auth.login.title")}
          </CardTitle>
          <CardDescription>
            {t("pages.auth.login.enterEmailBelow")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">
                  {t("pages.auth.login.email")}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("pages.auth.login.emailPlaceholder")}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FieldContent>
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">
                    {t("pages.auth.login.password")}
                  </FieldLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    {t("pages.auth.login.forgotPassword")}
                  </Link>
                </div>
                <FieldContent>
                  <Input
                    id="password"
                    type="password"
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
                    : t("pages.auth.login.signIn")}
                </Button>

                <FieldDescription className="text-center">
                  {t("pages.auth.login.dontHaveAccount")}{" "}
                  <Link
                    href="/auth/sign-up"
                    className="underline underline-offset-4"
                  >
                    {t("pages.auth.login.signUp")}
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        {t.rich("pages.auth.login.termsOfService", {
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
