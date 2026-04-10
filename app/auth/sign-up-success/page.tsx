import { Button } from "@/shared/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Page() {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {t("pages.auth.signUpSuccess.title")}
        </CardTitle>
        <CardDescription>
          {t("pages.auth.signUpSuccess.description")}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">
          <Link href="/auth/login">
            {t("pages.auth.signUpSuccess.accessAccount")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
