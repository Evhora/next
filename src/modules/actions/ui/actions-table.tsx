"use client";

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Heart,
  Leaf,
  MoreHorizontalIcon,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
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

import { ConfirmDeleteDialog } from "@/shared/ui/confirm-delete-dialog";

import { ActionDetailsDialog } from "./action-details-dialog";
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
  [Dream_DreamAreaOfLife.TRAINING_AND_EDUCATION]: null,
};

const STATUS_DOT: Record<Action_ActionStatus, string> = {
  [Action_ActionStatus.UNSPECIFIED]: "bg-muted-foreground",
  [Action_ActionStatus.NOT_STARTED]: "bg-zinc-300",
  [Action_ActionStatus.IN_PROGRESS]: "bg-amber-400",
  [Action_ActionStatus.COMPLETED]: "bg-rose-500",
};

const PAGE_SIZES = [10, 20, 50] as const;

export function ActionsTable({ actions }: ActionsTableProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);
  const [detailsActionId, setDetailsActionId] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(actions.length / pageSize));
  const pageActions = actions.slice((page - 1) * pageSize, page * pageSize);
  const detailsAction =
    actions.find((a) => a.id === detailsActionId) ?? null;

  const handleStatusChange = (id: string, status: Action_ActionStatus) => {
    startTransition(async () => {
      const result = await updateActionStatusAction(id, status);
      if (!result.ok) toast.error(result.message);
    });
  };

  const handleDelete = (id: string) => {
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
            {pageActions.map((action) => {
              const recurrenceKey = ACTION_RECURRENCE_LABELS[action.recurrence];
              const hasArea =
                action.dreamAreaOfLife !== Dream_DreamAreaOfLife.UNSPECIFIED;

              return (
                <TableRow
                  key={action.id}
                  onClick={() => setDetailsActionId(action.id)}
                  className="group cursor-pointer border-b last:border-0"
                >
                  {/* Title */}
                  <TableCell className="px-3 py-3 font-medium text-foreground">
                    {action.title || t("pages.dreams.form.untitled")}
                  </TableCell>

                  {/* Status */}
                  <TableCell
                    className="px-3"
                    onClick={(e) => e.stopPropagation()}
                  >
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

                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                        <ConfirmDeleteDialog
                          description={t("pages.actions.deleteConfirm")}
                          onConfirm={() => handleDelete(action.id)}
                          trigger={
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="size-4 shrink-0 text-destructive" />
                              {t("pages.actions.delete")}
                            </DropdownMenuItem>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {actions.length} linha(s) no total.
        </p>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Linhas por página</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setPage(1)}
              disabled={page === 1}
              aria-label="Primeira página"
            >
              <ChevronFirstIcon className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Página anterior"
            >
              <ChevronLeftIcon className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Próxima página"
            >
              <ChevronRightIcon className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              aria-label="Última página"
            >
              <ChevronLastIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <ActionDetailsDialog
        action={detailsAction}
        onOpenChange={(open) => {
          if (!open) setDetailsActionId(null);
        }}
      />
    </div>
  );
}
