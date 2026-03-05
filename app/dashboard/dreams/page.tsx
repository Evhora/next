"use client";

import { NewDreamModal } from "@/components/dreams/NewDreamModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dream } from "@/lib/domain/entities/dream";
import { ActionStatus } from "@/lib/domain/enums/action";
import {
  DreamAreaOfLifeNames,
  DreamStatus,
  DreamStatusNames,
} from "@/lib/domain/enums/dream";
import { MoreHorizontalIcon, Target, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type ActionFromApi = {
  id: string;
  dreamId?: string | null;
  dream_id?: string | null;
  status?: number | string;
};

function dreamStatusValue(s: number | string | undefined): number {
  if (s === undefined) return DreamStatus.UNSPECIFIED;
  return typeof s === "number"
    ? s
    : (DreamStatus[s as keyof typeof DreamStatus] ?? DreamStatus.UNSPECIFIED);
}

function actionStatusValue(s: number | string | undefined): number {
  if (s === undefined) return ActionStatus.UNSPECIFIED;
  return typeof s === "number"
    ? s
    : (ActionStatus[s as keyof typeof ActionStatus] ??
        ActionStatus.UNSPECIFIED);
}

export default function DreamsPage() {
  const t = useTranslations();

  const [dreams, setDreams] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingDreamId, setUpdatingDreamId] = useState<string | null>(null);

  const fetchDreams = useCallback(async () => {
    try {
      const [dreamsRes, actionsRes] = await Promise.all([
        fetch("/api/dreams"),
        fetch("/api/actions"),
      ]);
      const dreamsData = await dreamsRes.json();
      const actionsData = await actionsRes.json();

      if (dreamsRes.ok) setDreams(dreamsData.dreams || []);
      if (actionsRes.ok) setActions(actionsData.actions || []);
    } catch (error) {
      console.error("Error fetching dreams/actions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDreams();
  }, [fetchDreams]);

  const handleDreamCreated = () => {
    fetchDreams();
  };

  const getDreamProgress = useCallback(
    (dreamId: string) => {
      const dreamActions = actions.filter(
        (action: ActionFromApi) =>
          (action.dreamId ?? action.dream_id) === dreamId,
      );
      const total = dreamActions.length;
      const completed = dreamActions.filter(
        (action) => actionStatusValue(action.status) === ActionStatus.COMPLETED,
      ).length;
      return { total, completed };
    },
    [actions],
  );

  const handleStatusChange = async (dreamId: string, status: number) => {
    setUpdatingDreamId(dreamId);
    try {
      const res = await fetch(`/api/dreams/${dreamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const statusLabel = DreamStatusNames[status as DreamStatus];
        setDreams((prev) =>
          prev.map((dream) =>
            dream.id === dreamId
              ? ({ ...dream, status: statusLabel } as unknown as Dream)
              : dream,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating dream status:", error);
    } finally {
      setUpdatingDreamId(null);
    }
  };

  const handleDelete = async (dreamId: string) => {
    if (!window.confirm(t("pages.dreams.deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/dreams/${dreamId}`, { method: "DELETE" });
      if (res.ok) {
        setDreams((prev) => prev.filter((d) => d.id !== dreamId));
      }
    } catch (error) {
      console.error("Error deleting dream:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8" />
              <h1 className="text-3xl font-bold text-foreground">
                {t("pages.dreams.title")}
              </h1>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t("pages.dreams.description")}
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + {t("pages.dreams.newDream")}
          </Button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.dreams.stats.totalDreams")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "—" : dreams.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.dreams.stats.completedDreams")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading
                  ? "—"
                  : dreams.filter(
                      (d) =>
                        dreamStatusValue(d.status) === DreamStatus.COMPLETED,
                    ).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.dreams.stats.progressPercent")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading
                  ? "—"
                  : dreams.length === 0
                    ? "0%"
                    : `${Math.round(
                        (dreams.filter(
                          (d) =>
                            dreamStatusValue(d.status) ===
                            DreamStatus.COMPLETED,
                        ).length /
                          dreams.length) *
                          100,
                      )}%`}
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">
              {t("pages.dreams.loading")}
            </p>
          </div>
        ) : dreams.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                {t("pages.dreams.empty.message")}
              </p>
            </CardContent>
          </Card>
        ) : (
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
                  const { total, completed } = getDreamProgress(dream.id);
                  const isUpdating = updatingDreamId === dream.id;

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
                            `enums.dream.areaOfLife.${DreamAreaOfLifeNames[dream.area_of_life]}`,
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          disabled={isUpdating}
                          value={String(dreamStatusValue(dream.status))}
                          onValueChange={(v) =>
                            handleStatusChange(dream.id, Number(v))
                          }
                        >
                          <SelectTrigger className="h-8 w-full min-w-[8rem] max-w-[10rem] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={String(DreamStatus.IN_PROGRESS)}>
                              {t("pages.dreams.status.inProgress")}
                            </SelectItem>
                            <SelectItem value={String(DreamStatus.PAUSED)}>
                              {t("pages.dreams.status.paused")}
                            </SelectItem>
                            <SelectItem value={String(DreamStatus.COMPLETED)}>
                              {t("pages.dreams.status.completed")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {`${completed}/${total}`}
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
                            <DropdownMenuItem
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
          </Card>
        )}
      </div>

      <NewDreamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleDreamCreated}
      />
    </div>
  );
}
