"use client";

import { MoreHorizontalIcon, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Dream_DreamAreaOfLife } from "@/modules/dreams/domain/dream";
import { DREAM_AREA_OF_LIFE_LABELS } from "@/modules/dreams/domain/labels";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import { type Action, Action_ActionStatus } from "../domain/action";
import {
  ACTION_RECURRENCE_LABELS,
  ACTION_STATUS_LABELS,
  SELECTABLE_ACTION_STATUSES,
} from "../domain/labels";

import { deleteActionAction, updateActionStatusAction } from "./actions";

interface ActionsTableProps {
  actions: Action[];
}

const AREA_ICON: Record<Dream_DreamAreaOfLife, string> = {
  [Dream_DreamAreaOfLife.UNSPECIFIED]: "·",
  [Dream_DreamAreaOfLife.SPIRITUALITY]: "🧘",
  [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: "👨‍👩‍👧‍👦",
  [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: "💪",
  [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: "💼",
  [Dream_DreamAreaOfLife.LIFESTYLE]: "✨",
};

const STATUS_DOT: Record<Action_ActionStatus, string> = {
  [Action_ActionStatus.UNSPECIFIED]: "bg-zinc-300",
  [Action_ActionStatus.NOT_STARTED]: "bg-zinc-300",
  [Action_ActionStatus.IN_PROGRESS]: "bg-amber-400",
  [Action_ActionStatus.COMPLETED]: "bg-rose-500",
};

export function ActionsTable({ actions }: ActionsTableProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: string, status: Action_ActionStatus) => {
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
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
            <TableHead className="w-[30%] min-w-[12rem] text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
              {t("pages.actions.list.title")}
            </TableHead>
            <TableHead className="w-[18%] min-w-[8rem] text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
              {t("pages.actions.list.status")}
            </TableHead>
            <TableHead className="w-[14%] text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
              {t("pages.actions.list.recurrence")}
            </TableHead>
            <TableHead className="w-[18%] text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
              {t("pages.actions.list.area")}
            </TableHead>
            <TableHead className="w-[12%] min-w-[5rem] text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
              {t("pages.actions.list.dueDate")}
            </TableHead>
            <TableHead className="w-[8%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map((action) => {
            const recurrenceKey = ACTION_RECURRENCE_LABELS[action.recurrence];
            const hasArea =
              action.dreamAreaOfLife !== Dream_DreamAreaOfLife.UNSPECIFIED;

            return (
              <TableRow
                key={action.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              >
                <TableCell className="font-medium text-zinc-900 dark:text-zinc-50">
                  {action.title || t("pages.dreams.form.untitled")}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[action.status]}`}
                    />
                    <Select
                      disabled={isPending}
                      value={String(action.status)}
                      onValueChange={(v) =>
                        handleStatusChange(
                          action.id,
                          Number(v) as Action_ActionStatus,
                        )
                      }
                    >
                      <SelectTrigger className="h-8 w-full min-w-[7rem] max-w-[9rem] text-xs">
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
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className="font-normal">
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
                </TableCell>

                <TableCell>
                  {hasArea ? (
                    <Badge
                      variant="secondary"
                      className="inline-flex w-fit items-center gap-1.5 font-normal"
                    >
                      <span className="text-sm leading-none">
                        {AREA_ICON[action.dreamAreaOfLife]}
                      </span>
                      {t(
                        `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[action.dreamAreaOfLife]}` as
                          | "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP"
                          | "enums.dream.areaOfLife.HEALTH_AND_WELL_BEING"
                          | "enums.dream.areaOfLife.BUSINESS_AND_FINANCE"
                          | "enums.dream.areaOfLife.SPIRITUALITY"
                          | "enums.dream.areaOfLife.LIFESTYLE",
                      )}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell className="text-sm text-zinc-500 dark:text-zinc-400">
                  {action.dueDate
                    ? new Date(action.dueDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "—"}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={t("pages.actions.list.actions")}
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(action.id)}
                      >
                        <Trash2 className="size-4 shrink-0" />
                        {t("pages.actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
