"use client";

import { MoreHorizontalIcon, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
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

import { type Dream, Dream_DreamAreaOfLife, Dream_DreamStatus } from "../domain/dream";
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

const AREA_ICON: Record<Dream_DreamAreaOfLife, string> = {
  [Dream_DreamAreaOfLife.UNSPECIFIED]: "·",
  [Dream_DreamAreaOfLife.SPIRITUALITY]: "🧘",
  [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: "👨‍👩‍👧‍👦",
  [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: "💪",
  [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: "💼",
  [Dream_DreamAreaOfLife.LIFESTYLE]: "✨",
};

const STATUS_DOT: Record<Dream_DreamStatus, string> = {
  [Dream_DreamStatus.UNSPECIFIED]: "bg-zinc-300",
  [Dream_DreamStatus.IN_PROGRESS]: "bg-amber-400",
  [Dream_DreamStatus.COMPLETED]: "bg-rose-500",
  [Dream_DreamStatus.PAUSED]: "bg-zinc-400",
};

export function DreamsTable({ dreams, progress = {} }: DreamsTableProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

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
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
            <TableHead className="w-[30%] min-w-[12rem] text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
              {t("pages.dreams.list.title")}
            </TableHead>
            <TableHead className="w-[18%] text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
              {t("pages.dreams.list.area")}
            </TableHead>
            <TableHead className="w-[18%] min-w-[8rem] text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
              {t("pages.dreams.list.status")}
            </TableHead>
            <TableHead className="w-[14%] min-w-[6rem] text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
              {t("pages.dreams.list.progress")}
            </TableHead>
            <TableHead className="w-[12%] min-w-[5rem] text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
              {t("pages.dreams.list.deadline")}
            </TableHead>
            <TableHead className="w-[8%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {dreams.map((dream) => {
            const dreamProgress = progress[dream.id];
            const pct =
              dreamProgress && dreamProgress.total > 0
                ? Math.round((dreamProgress.completed / dreamProgress.total) * 100)
                : 0;

            return (
              <TableRow
                key={dream.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
              >
                <TableCell className="font-medium text-zinc-900 dark:text-zinc-50">
                  {dream.title || t("pages.dreams.form.untitled")}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="secondary"
                    className="inline-flex w-fit items-center gap-1.5 font-normal"
                  >
                    <span className="text-sm leading-none">
                      {AREA_ICON[dream.areaOfLife]}
                    </span>
                    {t(
                      `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[dream.areaOfLife]}` as
                        | "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP"
                        | "enums.dream.areaOfLife.HEALTH_AND_WELL_BEING"
                        | "enums.dream.areaOfLife.BUSINESS_AND_FINANCE"
                        | "enums.dream.areaOfLife.SPIRITUALITY"
                        | "enums.dream.areaOfLife.LIFESTYLE",
                    )}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[dream.status]}`}
                    />
                    <Select
                      disabled={isPending}
                      value={String(dream.status)}
                      onValueChange={(v) =>
                        handleStatusChange(dream.id, Number(v))
                      }
                    >
                      <SelectTrigger className="h-8 w-full min-w-[7rem] max-w-[9rem] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SELECTABLE_DREAM_STATUSES.map((status) => (
                          <SelectItem key={status} value={String(status)}>
                            {t(
                              `pages.dreams.status.${statusTranslationKey(status)}`,
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>

                <TableCell>
                  {dreamProgress ? (
                    <div className="flex min-w-[5rem] items-center gap-2">
                      <div className="relative flex-1">
                        <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800" />
                        <div
                          className="absolute inset-y-0 left-0 h-px bg-rose-500 transition-all duration-700 dark:bg-rose-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                        {dreamProgress.completed}/{dreamProgress.total}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell className="text-sm text-zinc-500 dark:text-zinc-400">
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
                        className="size-8"
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
                        <Trash2 className="size-4 shrink-0" />
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
  );
}

const statusTranslationKey = (status: Dream_DreamStatus): string => {
  switch (status) {
    case Dream_DreamStatus.IN_PROGRESS:
      return "inProgress";
    case Dream_DreamStatus.PAUSED:
      return "paused";
    case Dream_DreamStatus.COMPLETED:
      return "completed";
    default:
      return DREAM_STATUS_LABELS[status]?.toLowerCase() ?? "unspecified";
  }
};
