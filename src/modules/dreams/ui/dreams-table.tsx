"use client";

import { MoreHorizontalIcon, Target, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
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

import { type Dream, Dream_DreamStatus } from "../domain/dream";
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
  /** Map of dream id → action progress. Empty if the actions module hasn't loaded data. */
  progress?: Record<string, DreamProgress>;
}

/**
 * Pure client component: receives serialized DreamProps from the Server
 * Component and renders the interactive parts (status select + delete menu).
 *
 * Status changes call `updateDreamStatusAction` directly inside a transition;
 * we surface success/failure with sonner toasts and let the action's
 * `revalidatePath` push fresh server data back into the tree.
 */
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
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%] min-w-[12rem]">
              {t("pages.dreams.list.title")}
            </TableHead>
            <TableHead className="w-[18%]">
              {t("pages.dreams.list.area")}
            </TableHead>
            <TableHead className="w-[18%] min-w-[8rem]">
              {t("pages.dreams.list.status")}
            </TableHead>
            <TableHead className="w-[10%] min-w-[4rem]">
              {t("pages.dreams.list.progress")}
            </TableHead>
            <TableHead className="w-[12%] min-w-[5rem]">
              {t("pages.dreams.list.deadline")}
            </TableHead>
            <TableHead className="w-[12%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dreams.map((dream) => {
            const dreamProgress = progress[dream.id];
            return (
              <TableRow key={dream.id}>
                <TableCell className="font-medium">
                  {dream.title || t("pages.dreams.form.untitled")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="inline-flex w-fit items-center gap-1.5 font-normal"
                  >
                    <Target className="size-3.5 shrink-0" />
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
                  <Select
                    disabled={isPending}
                    value={String(dream.status)}
                    onValueChange={(v) =>
                      handleStatusChange(dream.id, Number(v))
                    }
                  >
                    <SelectTrigger className="h-8 w-full min-w-[8rem] max-w-[10rem] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SELECTABLE_DREAM_STATUSES.map((status) => (
                        <SelectItem key={status} value={String(status)}>
                          {t(
                            `pages.dreams.status.${
                              statusTranslationKey(status)
                            }`,
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dreamProgress
                    ? `${dreamProgress.completed}/${dreamProgress.total}`
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
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
                      <DropdownMenuItem onClick={() => handleDelete(dream.id)}>
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
    </Card>
  );
}

/**
 * Map a numeric Dream_DreamStatus to the camelCase translation key the i18n
 * bundle uses (`pages.dreams.status.inProgress`, etc). Centralised so the map
 * lives next to the only place that needs it.
 */
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
