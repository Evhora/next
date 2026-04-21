"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { updatePaymentMethodAction } from "./actions";

let stripePromise: Promise<StripeJs | null> | null = null;
function getStripeJs() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = key ? loadStripe(key) : Promise.resolve(null);
  }
  return stripePromise;
}

function PaymentForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/account/billing`,
        },
        redirect: "if_required",
      });
      if (error) throw new Error(error.message ?? "Setup failed");
      toast.success(t("pages.billing.updatePayment.success"));
      onDone();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Setup failed";
      toast.error(t("pages.billing.updatePayment.error"), {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading
          ? t("common.loading")
          : t("pages.billing.updatePayment.submit")}
      </Button>
    </form>
  );
}

export function UpdatePaymentMethodDialog() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || clientSecret) return;
    let cancelled = false;
    setLoading(true);
    updatePaymentMethodAction()
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) throw new Error(result.message);
        setClientSecret(result.data.clientSecret);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "unknown";
        toast.error(t("pages.billing.updatePayment.error"), {
          description: message,
        });
        setOpen(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, clientSecret, t]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setClientSecret(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          {t("pages.billing.updatePayment.button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pages.billing.updatePayment.title")}</DialogTitle>
          <DialogDescription>
            {t("pages.billing.updatePayment.description")}
          </DialogDescription>
        </DialogHeader>
        {loading || !clientSecret ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : (
          <Elements
            stripe={getStripeJs()}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <PaymentForm onDone={() => setOpen(false)} />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
