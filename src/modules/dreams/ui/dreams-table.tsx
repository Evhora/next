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

export interface DreamProgress {
  total: number;
  completed: number;
}

interface DreamsTableProps {
  dreams: Dream[];
  progress?: Record<string, DreamProgress>;
}

const AREA_ICON: Record<Dream_DreamAreaOfLife, LucideIcon | null> = {
  [Dream_DreamAreaOfLife.UNSPECIFIED]: null,
  [Dream_DreamAreaOfLife.SPIRITUALITY]: Leaf,
  [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: Users,
  [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: Heart,
  [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: Briefcase,
  [Dream_DreamAreaOfLife.LIFESTYLE]: Sparkles,
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

const PAGE_SIZES = [10, 20, 50] as const;

export function DreamsTable({ dreams, progress = {} }: DreamsTableProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(dreams.length / pageSize));
  const pageDreams = dreams.slice((page - 1) * pageSize, page * pageSize);

  const allPageSelected =
    pageDreams.length > 0 && pageDreams.every((d) => selected.has(d.id));
  const somePageSelected =
    pageDreams.some((d) => selected.has(d.id)) && !allPageSelected;

  const toggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageDreams.forEach((d) => next.delete(d.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pageDreams.forEach((d) => next.add(d.id));
        return next;
      });
    }
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleStatusChange = (id: string, nextStatus: number) => {
    startTransition(async () => {
      const result = await updateDreamStatusAction(id, nextStatus);
      if (!result.ok) toast.error(result.message);
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t("pages.dreams.deleteConfirm"))) return;
    startTransition(async () => {
      const result = await deleteDreamAction(id);
      if (!result.ok) toast.error(result.message);
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
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
                Ações
              </TableHead>
              <TableHead className="hidden px-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                Total
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

              return (
                <TableRow
                  key={dream.id}
                  data-state={selected.has(dream.id) ? "selected" : undefined}
                  className="group border-b last:border-0"
                >
                  {/* Title */}
                  <TableCell className="px-3 py-3 font-medium text-foreground">
                    {dream.title || t("pages.dreams.form.untitled")}
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
                  <TableCell className="px-3">
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

                  {/* Completed actions */}
                  <TableCell className="hidden px-3 text-right tabular-nums text-muted-foreground md:table-cell">
                    {prog ? prog.completed : "—"}
                  </TableCell>

                  {/* Total actions */}
                  <TableCell className="hidden px-3 text-right tabular-nums text-muted-foreground md:table-cell">
                    {prog ? prog.total : "—"}
                  </TableCell>

                  {/* Deadline */}
                  <TableCell className="hidden px-3 text-sm tabular-nums text-muted-foreground lg:table-cell">
                    {dream.deadline
                      ? new Date(dream.deadline).toLocaleDateString("pt-BR")
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
                          aria-label={t("pages.dreams.list.actions")}
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(dream.id)}
                        >
                          <Trash2 className="size-4 shrink-0 text-destructive" />
                          {t("pages.dreams.delete")}
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

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Selection count */}
        <p className="text-xs text-muted-foreground">
          {selected.size} de {dreams.length} linha(s) selecionada(s).
        </p>

        {/* Pagination controls */}
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
