"use client";

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Heart,
  Leaf,
  MoreHorizontalIcon,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
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

const AREA_ICON: Record<Dream_DreamAreaOfLife, LucideIcon | null> = {
  [Dream_DreamAreaOfLife.UNSPECIFIED]: null,
  [Dream_DreamAreaOfLife.SPIRITUALITY]: Leaf,
  [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: Users,
  [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: Heart,
  [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: Briefcase,
  [Dream_DreamAreaOfLife.LIFESTYLE]: Sparkles,
};

const STATUS_DOT: Record<Action_ActionStatus, string> = {
  [Action_ActionStatus.UNSPECIFIED]: "bg-muted-foreground",
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
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("pages.actions.list.title")}
              </TableHead>
              <TableHead className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("pages.actions.list.status")}
              </TableHead>
              <TableHead className="hidden px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">
                {t("pages.actions.list.recurrence")}
              </TableHead>
              <TableHead className="hidden px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                {t("pages.actions.list.area")}
              </TableHead>
              <TableHead className="hidden px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:table-cell">
                {t("pages.actions.list.dueDate")}
              </TableHead>
              <TableHead className="w-10 px-2" />
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
                  className="group border-b last:border-0"
                >
                  {/* Title */}
                  <TableCell className="px-3 py-3 font-medium text-foreground">
                    {action.title || t("pages.dreams.form.untitled")}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-3">
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
                      <SelectTrigger className="w-fit border-0 bg-transparent px-2 shadow-none hover:bg-muted focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SELECTABLE_ACTION_STATUSES.map((opt) => (
                          <SelectItem key={opt} value={String(opt)}>
                            <div className="flex items-center gap-2">
                              <span
                                className={`size-2 rounded-full ${STATUS_DOT[opt]}`}
                              />
                              {t(
                                `enums.action.status.${ACTION_STATUS_LABELS[opt]}` as
                                  | "enums.action.status.NOT_STARTED"
                                  | "enums.action.status.IN_PROGRESS"
                                  | "enums.action.status.COMPLETED",
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Recurrence */}
                  <TableCell className="hidden px-3 sm:table-cell">
                    <Badge
                      variant="outline"
                      className="font-normal text-sm text-foreground"
                    >
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

                  {/* Area */}
                  <TableCell className="hidden px-3 md:table-cell">
                    {hasArea ? (
                      <Badge
                        variant="outline"
                        className="gap-1.5 font-normal text-sm text-foreground"
                      >
                        {(() => {
                          const I = AREA_ICON[action.dreamAreaOfLife];
                          return I ? <I className="h-3 w-3" /> : null;
                        })()}
                        <span className="truncate">
                          {t(
                            `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[action.dreamAreaOfLife]}` as
                              | "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP"
                              | "enums.dream.areaOfLife.HEALTH_AND_WELL_BEING"
                              | "enums.dream.areaOfLife.BUSINESS_AND_FINANCE"
                              | "enums.dream.areaOfLife.SPIRITUALITY"
                              | "enums.dream.areaOfLife.LIFESTYLE",
                          )}
                        </span>
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Due date */}
                  <TableCell className="hidden px-3 text-sm tabular-nums text-muted-foreground lg:table-cell">
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
                          className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
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
                          <Trash2 className="size-4 shrink-0 text-destructive" />
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
    </div>
  );
}
