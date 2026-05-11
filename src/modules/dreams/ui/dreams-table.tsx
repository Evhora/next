"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Heart,
  Leaf,
  MoreHorizontalIcon,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ConfirmDeleteDialog } from "@/shared/ui/confirm-delete-dialog";
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

import {
  type Action,
  Action_ActionStatus,
  ACTION_RECURRENCE_LABELS,
  ACTION_STATUS_LABELS,
  type DreamOption,
  NewActionDialog,
} from "@/modules/actions";

import {
  type Dream,
  Dream_DreamAreaOfLife,
  Dream_DreamStatus,
} from "../domain/dream";
import {
  DREAM_AREA_OF_LIFE_LABELS,
  DREAM_STATUS_LABELS,
  SELECTABLE_DREAM_STATUSES,
} from "../domain/labels";

import { deleteDreamAction, updateDreamStatusAction } from "./actions";
import { DreamDetailsDialog } from "./dream-details-dialog";

export interface DreamProgress {
  total: number;
  completed: number;
}

interface DreamsTableProps {
  dreams: Dream[];
  progress?: Record<string, DreamProgress>;
  actionsByDream?: Record<string, Action[]>;
}

const AREA_ICON: Record<Dream_DreamAreaOfLife, LucideIcon | null> = {
  [Dream_DreamAreaOfLife.UNSPECIFIED]: null,
  [Dream_DreamAreaOfLife.SPIRITUALITY]: Leaf,
  [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: Users,
  [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: Heart,
  [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: Briefcase,
  [Dream_DreamAreaOfLife.LIFESTYLE]: Sparkles,
  [Dream_DreamAreaOfLife.TRAINING_AND_EDUCATION]: BookOpen,
};

const STATUS_CONFIG: Record<Dream_DreamStatus, { label: string; dot: string }> =
  {
    [Dream_DreamStatus.UNSPECIFIED]: { label: "—", dot: "bg-muted-foreground" },
    [Dream_DreamStatus.IN_PROGRESS]: {
      label: "In Process",
      dot: "bg-amber-400",
    },
    [Dream_DreamStatus.COMPLETED]: { label: "Done", dot: "bg-emerald-500" },
    [Dream_DreamStatus.PAUSED]: { label: "Paused", dot: "bg-zinc-400" },
  };

const AREA_TABS = [
  { label: "Todas", value: null },
  { label: "Família", value: Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP },
  { label: "Saúde", value: Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING },
  { label: "Negócios", value: Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE },
  {
    label: "Espiritualidade",
    value: Dream_DreamAreaOfLife.SPIRITUALITY,
  },
  { label: "Lifestyle", value: Dream_DreamAreaOfLife.LIFESTYLE },
  {
    label: "Capacitação",
    value: Dream_DreamAreaOfLife.TRAINING_AND_EDUCATION,
  },
] as const;

const PAGE_SIZES = [10, 20, 50] as const;

export function DreamsTable({
  dreams,
  progress = {},
  actionsByDream = {},
}: DreamsTableProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [areaFilter, setAreaFilter] = useState<Dream_DreamAreaOfLife | null>(
    null,
  );
  const [detailsDreamId, setDetailsDreamId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [newActionForId, setNewActionForId] = useState<string | null>(null);
  const [deleteForId, setDeleteForId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);

  const filtered =
    areaFilter === null
      ? dreams
      : dreams.filter((d) => d.areaOfLife === areaFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageDreams = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleStatusChange = (id: string, nextStatus: number) => {
    startTransition(async () => {
      const result = await updateDreamStatusAction(id, nextStatus);
      if (!result.ok) toast.error(result.message);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteDreamAction(id);
      if (!result.ok) toast.error(result.message);
    });
  };

  const detailsDream = dreams.find((d) => d.id === detailsDreamId) ?? null;

  const dreamOptions: DreamOption[] = dreams.map((d) => ({
    id: d.id,
    title: d.title,
    areaOfLife: d.areaOfLife,
  }));

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Area filter tabs */}
      <div className="flex gap-1 overflow-x-auto border-b bg-muted/20 px-3 py-2">
        {AREA_TABS.map((tab) => (
          <button
            key={String(tab.value)}
            onClick={() => {
              setAreaFilter(tab.value as Dream_DreamAreaOfLife | null);
              setPage(1);
            }}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              areaFilter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 px-2" />
              <TableHead className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sonho
              </TableHead>
              <TableHead className="hidden px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">
                Área
              </TableHead>
              <TableHead className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="hidden px-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                Progresso
              </TableHead>
              <TableHead className="hidden px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:table-cell">
                Prazo
              </TableHead>
              <TableHead className="w-10 px-2" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageDreams.map((dream) => {
              const prog = progress[dream.id];
              const dreamActions = actionsByDream[dream.id] ?? [];
              const isExpanded = expandedIds.has(dream.id);

              return (
                <Fragment key={dream.id}>
                  <TableRow
                    onClick={() => setDetailsDreamId(dream.id)}
                    className={`group cursor-pointer border-b last:border-0`}
                  >
                    {/* Expand toggle */}
                    <TableCell
                      className="w-10 px-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => toggleExpanded(dream.id)}
                        disabled={dreamActions.length === 0}
                        aria-label={
                          isExpanded ? "Recolher ações" : "Expandir ações"
                        }
                        aria-expanded={isExpanded}
                      >
                        <ChevronRightIcon
                          className={`size-4 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          } ${dreamActions.length === 0 ? "opacity-30" : ""}`}
                        />
                      </Button>
                    </TableCell>

                    {/* Title */}
                    <TableCell className="px-3 py-3 font-medium text-foreground">
                      <div className="flex flex-col gap-1">
                        <span>
                          {dream.title || t("pages.dreams.form.untitled")}
                        </span>
                      </div>
                    </TableCell>

                    {/* Area */}
                    <TableCell className="hidden px-3 sm:table-cell">
                      <Badge
                        variant="outline"
                        className="gap-1.5 font-normal text-sm text-foreground"
                      >
                        {(() => {
                          const I = AREA_ICON[dream.areaOfLife];
                          return I ? <I className="h-3 w-3" /> : null;
                        })()}
                        <span className="truncate">
                          {t(
                            `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[dream.areaOfLife]}` as Parameters<
                              typeof t
                            >[0],
                          )}
                        </span>
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell
                      className="px-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Select
                        disabled={isPending}
                        value={String(dream.status)}
                        onValueChange={(v) =>
                          handleStatusChange(dream.id, Number(v))
                        }
                      >
                        <SelectTrigger className="w-fit border-0 bg-transparent px-2 shadow-none hover:bg-muted focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SELECTABLE_DREAM_STATUSES.map((s) => (
                            <SelectItem key={s} value={String(s)}>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`size-2 rounded-full ${STATUS_CONFIG[s].dot}`}
                                />
                                {statusTranslationKey(s, t)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Progress */}
                    <TableCell className="hidden px-3 md:table-cell">
                      {prog ? (
                        <span className="tabular-nums text-muted-foreground text-sm">
                          {prog.completed}/{prog.total}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Deadline */}
                    <TableCell className="hidden px-3 text-sm tabular-nums text-muted-foreground lg:table-cell">
                      {dream.deadline
                        ? new Date(dream.deadline).toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>

                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu
                        modal={false}
                        open={openMenuId === dream.id}
                        onOpenChange={(o) => setOpenMenuId(o ? dream.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label={t("pages.dreams.list.actions")}
                          >
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => setDetailsDreamId(dream.id)}
                          >
                            <Pencil className="size-4 shrink-0" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setNewActionForId(dream.id)}
                          >
                            <Plus className="size-4 shrink-0" />
                            {t("pages.actions.newAction")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setDeleteForId(dream.id)}
                          >
                            <Trash2 className="size-4 shrink-0 text-destructive" />
                            {t("pages.dreams.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {dreamActions.length > 0 && (
                    <TableRow
                      className={`border-b bg-muted/10 hover:bg-muted/10 ${
                        isExpanded ? "" : "border-b-0"
                      }`}
                    >
                      <TableCell className="p-0" />
                      <TableCell colSpan={5} className="p-0">
                        <div
                          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <ul className="flex flex-col gap-1.5 px-3 py-3">
                              {dreamActions.map((action) => {
                                const done =
                                  action.status ===
                                  Action_ActionStatus.COMPLETED;
                                const AreaIcon =
                                  AREA_ICON[action.dreamAreaOfLife];
                                return (
                                  <li
                                    key={action.id}
                                    className="flex flex-wrap items-center gap-2 text-sm"
                                  >
                                    <span
                                      className={
                                        done
                                          ? "text-muted-foreground line-through"
                                          : "text-foreground"
                                      }
                                    >
                                      {action.title}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="gap-1 font-normal text-xs text-muted-foreground"
                                    >
                                      <span
                                        className={`size-1.5 shrink-0 rounded-full ${
                                          done
                                            ? "bg-emerald-500"
                                            : action.status ===
                                                Action_ActionStatus.IN_PROGRESS
                                              ? "bg-amber-400"
                                              : "bg-muted-foreground/40"
                                        }`}
                                      />
                                      {t(
                                        `enums.action.status.${ACTION_STATUS_LABELS[action.status]}` as Parameters<
                                          typeof t
                                        >[0],
                                      )}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="gap-1 font-normal text-xs text-muted-foreground"
                                    >
                                      {t(
                                        `enums.action.recurrence.${ACTION_RECURRENCE_LABELS[action.recurrence]}` as Parameters<
                                          typeof t
                                        >[0],
                                      )}
                                    </Badge>
                                    {AreaIcon && (
                                      <Badge
                                        variant="outline"
                                        className="gap-1 font-normal text-xs text-muted-foreground"
                                      >
                                        <AreaIcon className="h-3 w-3" />
                                        {t(
                                          `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[action.dreamAreaOfLife]}` as Parameters<
                                            typeof t
                                          >[0],
                                        )}
                                      </Badge>
                                    )}
                                    {action.dueDate && (
                                      <span className="text-xs tabular-nums text-muted-foreground">
                                        {new Date(
                                          action.dueDate,
                                        ).toLocaleDateString("pt-BR")}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} linha(s) no total.
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

      <NewActionDialog
        dreams={dreamOptions}
        lockedDreamId={newActionForId ?? undefined}
        open={newActionForId !== null}
        onOpenChange={(o) => {
          if (!o) setNewActionForId(null);
        }}
      />

      <ConfirmDeleteDialog
        description={t("pages.dreams.deleteConfirm")}
        onConfirm={() => {
          if (deleteForId) handleDelete(deleteForId);
          setDeleteForId(null);
        }}
        open={deleteForId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteForId(null);
        }}
      />

      <DreamDetailsDialog
        dream={detailsDream}
        onOpenChange={(open) => {
          if (!open) setDetailsDreamId(null);
        }}
      />
    </div>
  );
}

function statusTranslationKey(
  status: Dream_DreamStatus,
  t: ReturnType<typeof useTranslations>,
): string {
  switch (status) {
    case Dream_DreamStatus.IN_PROGRESS:
      return t("pages.dreams.status.inProgress");
    case Dream_DreamStatus.PAUSED:
      return t("pages.dreams.status.paused");
    case Dream_DreamStatus.COMPLETED:
      return t("pages.dreams.status.completed");
    default:
      return DREAM_STATUS_LABELS[status]?.toLowerCase() ?? "—";
  }
}
