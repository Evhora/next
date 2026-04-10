"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import type { ActionProps } from "../domain/Action";
import { ACTION_RECURRENCE_LABELS } from "../domain/ActionRecurrence";
import {
  ACTION_STATUS_LABELS,
  ActionStatus,
  SELECTABLE_ACTION_STATUSES,
} from "../domain/ActionStatus";

import { deleteActionAction, updateActionStatusAction } from "./actions";

interface ActionsTableProps {
  actions: ActionProps[];
}

export function ActionsTable({ actions }: ActionsTableProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: string, status: ActionStatus) => {
    startTransition(async () => {
      const result = await updateActionStatusAction(id, status);
      if (!result.ok) toast.error(result.message);
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t("pages.actions.deleteConfirm"))) return;
    startTransition(async () => {
      const result = await deleteActionAction(id);
      if (!result.ok) toast.error(result.message);
    });
  };

  return (
    <Card>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        <div className="grid grid-cols-1 gap-4 px-6 py-4 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:grid-cols-12">
          <div className="sm:col-span-4">{t("pages.actions.list.title")}</div>
          <div className="sm:col-span-2">{t("pages.actions.list.status")}</div>
          <div className="sm:col-span-2">
            {t("pages.actions.list.recurrence")}
          </div>
          <div className="sm:col-span-2">{t("pages.actions.list.area")}</div>
          <div className="sm:col-span-1">{t("pages.actions.list.dueDate")}</div>
          <div className="sm:col-span-1">{t("pages.actions.list.actions")}</div>
        </div>

        {actions.map((action) => {
          const recurrenceKey = ACTION_RECURRENCE_LABELS[action.recurrence];
          return (
            <div
              key={action.id}
              className="grid grid-cols-1 gap-4 px-6 py-4 text-sm sm:grid-cols-12"
            >
              <div className="min-w-0 font-medium text-foreground sm:col-span-4">
                {action.title || t("pages.dreams.form.untitled")}
              </div>
              <div className="sm:col-span-2">
                <Select
                  disabled={isPending}
                  value={String(action.status)}
                  onValueChange={(v) =>
                    handleStatusChange(action.id, Number(v) as ActionStatus)
                  }
                >
                  <SelectTrigger className="h-8 w-full max-w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SELECTABLE_ACTION_STATUSES.map((opt) => (
                      <SelectItem key={opt} value={String(opt)}>
                        {t(
                          `enums.action.status.${ACTION_STATUS_LABELS[opt]}` as
                            | "enums.action.status.NOT_STARTED"
                            | "enums.action.status.IN_PROGRESS"
                            | "enums.action.status.COMPLETED",
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Badge variant="outline">
                  {t(
                    `enums.action.recurrence.${recurrenceKey}` as
                      | "enums.action.recurrence.UNSPECIFIED"
                      | "enums.action.recurrence.ONCE"
                      | "enums.action.recurrence.DAILY"
                      | "enums.action.recurrence.WEEKDAYS"
                      | "enums.action.recurrence.WEEKENDS"
                      | "enums.action.recurrence.SPECIAL_DAYS",
                  )}
                </Badge>
              </div>
              <div className="sm:col-span-2">
                {action.dreamAreaOfLife ? (
                  <Badge variant="secondary">
                    {t(`enums.dream.areaOfLife.${action.dreamAreaOfLife}`)}
                  </Badge>
                ) : (
                  <span className="text-zinc-500">—</span>
                )}
              </div>
              <div className="text-zinc-600 dark:text-zinc-400 sm:col-span-1">
                {action.dueDate
                  ? new Date(action.dueDate).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "—"}
              </div>
              <div className="flex items-center sm:col-span-1">
                <button
                  type="button"
                  aria-label={t("pages.actions.delete")}
                  onClick={() => handleDelete(action.id)}
                  disabled={isPending}
                  className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

