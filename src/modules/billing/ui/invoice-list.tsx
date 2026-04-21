import { timestampDate } from "@bufbuild/protobuf/wkt";
import { getTranslations } from "next-intl/server";

import { buildCtx } from "@/shared/context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import { listInvoices } from "../application/list-invoices";
import { invoiceStatusToString } from "../domain/invoice";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatAmount(cents: bigint, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(cents) / 100);
}

export async function InvoiceList() {
  const t = await getTranslations();
  const ctx = await buildCtx();
  const invoices = await listInvoices({
    userId: ctx.userId,
    billing: ctx.billing,
  });

  if (invoices.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        {t("pages.billing.invoices.empty")}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("pages.billing.invoices.date")}</TableHead>
          <TableHead>{t("pages.billing.invoices.number")}</TableHead>
          <TableHead>{t("pages.billing.invoices.status")}</TableHead>
          <TableHead className="text-right">
            {t("pages.billing.invoices.amount")}
          </TableHead>
          <TableHead className="text-right">
            {t("pages.billing.invoices.download")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => {
          const amount = inv.amountPaid > 0n ? inv.amountPaid : inv.amountDue;
          return (
            <TableRow key={inv.id}>
              <TableCell>
                {inv.createdAt ? formatDate(timestampDate(inv.createdAt)) : "—"}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {inv.number || inv.id}
              </TableCell>
              <TableCell>{invoiceStatusToString(inv.status) ?? "—"}</TableCell>
              <TableCell className="text-right">
                {formatAmount(amount, inv.currency)}
              </TableCell>
              <TableCell className="text-right">
                {inv.hostedInvoiceUrl ? (
                  <a
                    href={inv.hostedInvoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    {t("pages.billing.invoices.view")}
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
