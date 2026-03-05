"use client";

import { NewActionModal } from "@/components/actions/NewActionModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Action } from "@/lib/domain/entities/action";
import {
  ActionRecurrence,
  ActionRecurrenceNames,
  ActionStatus,
  ActionStatusNames,
} from "@/lib/domain/enums/action";
import { DreamAreaOfLifeNames } from "@/lib/domain/enums/dream";
import { ListChecks, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type ActionFromApi = Action & {
  dueDate?: string | null;
  dreamAreaOfLife?: string | null;
  dreamId?: string | null;
  dream_id?: string | null;
  recurrence?: number | string;
  status?: number | string;
};

function getDueDate(action: ActionFromApi): string | null {
  return action.dueDate ?? action.due_date ?? null;
}

function getStatus(action: ActionFromApi): ActionStatus {
  const s = action.status;
  if (s === undefined) return ActionStatus.UNSPECIFIED;
  return typeof s === "number"
    ? s
    : (ActionStatus[s as keyof typeof ActionStatus] ??
        ActionStatus.UNSPECIFIED);
}

function getRecurrenceLabel(action: ActionFromApi): string {
  const rec = action.recurrence;
  if (rec === undefined) return "UNSPECIFIED";
  if (typeof rec === "string") return rec;
  return ActionRecurrenceNames[rec as ActionRecurrence] ?? "UNSPECIFIED";
}

export default function ActionsPage() {
  const t = useTranslations();
  const [actions, setActions] = useState<ActionFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingActionId, setUpdatingActionId] = useState<string | null>(null);

  const fetchActions = useCallback(async () => {
    try {
      const response = await fetch("/api/actions");
      const data = await response.json();

      if (response.ok) {
        setActions(data.actions || []);
      }
    } catch (error) {
      console.error("Error fetching actions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const updateActionStatus = async (
    actionId: string,
    newStatus: ActionStatus,
  ) => {
    setUpdatingActionId(actionId);
    try {
      const response = await fetch(`/api/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const statusLabel = ActionStatusNames[newStatus];
        setActions((prev) =>
          prev.map((a) =>
            a.id === actionId
              ? ({ ...a, status: statusLabel } as unknown as ActionFromApi)
              : a,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating action status:", error);
    } finally {
      setUpdatingActionId(null);
    }
  };

  const deleteAction = async (actionId: string) => {
    if (!window.confirm(t("pages.actions.deleteConfirm"))) return;
    try {
      const response = await fetch(`/api/actions/${actionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setActions((prev) => prev.filter((a) => a.id !== actionId));
      }
    } catch (error) {
      console.error("Error deleting action:", error);
    }
  };

  const statusOptions = [
    ActionStatus.UNSPECIFIED,
    ActionStatus.NOT_STARTED,
    ActionStatus.IN_PROGRESS,
    ActionStatus.COMPLETED,
  ] as const;

  const completedCount = actions.filter(
    (a) => getStatus(a) === ActionStatus.COMPLETED,
  ).length;
  const progressPercent =
    actions.length === 0
      ? 0
      : Math.round((completedCount / actions.length) * 100);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ListChecks className="h-8 w-8" />
              <h1 className="text-3xl font-bold text-foreground">
                {t("pages.actions.title")}
              </h1>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t("pages.actions.description")}
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + {t("pages.actions.newAction")}
          </Button>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.actions.stats.totalActions")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "—" : actions.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.actions.stats.completedActions")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "—" : completedCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {t("pages.actions.stats.progressPercent")}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {loading ? "—" : `${progressPercent}%`}
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">
              {t("pages.actions.loading")}
            </p>
          </div>
        ) : actions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                {t("pages.actions.empty.message")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {/* Header row */}
              <div className="grid grid-cols-1 gap-4 px-6 py-4 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:grid-cols-12">
                <div className="sm:col-span-4">
                  {t("pages.actions.list.title")}
                </div>
                <div className="sm:col-span-2">
                  {t("pages.actions.list.status")}
                </div>
                <div className="sm:col-span-2">
                  {t("pages.actions.list.recurrence")}
                </div>
                <div className="sm:col-span-2">
                  {t("pages.actions.list.area")}
                </div>
                <div className="sm:col-span-1">
                  {t("pages.actions.list.dueDate")}
                </div>
                <div className="sm:col-span-1">
                  {t("pages.actions.list.actions")}
                </div>
              </div>
              {/* Data rows */}
              {actions.map((action) => {
                const dueDate = getDueDate(action);
                const recurrenceKey = getRecurrenceLabel(action);
                const areaKey =
                  action.dreamAreaOfLife ??
                  (action.dream_area_of_life != null
                    ? DreamAreaOfLifeNames[
                        action.dream_area_of_life as keyof typeof DreamAreaOfLifeNames
                      ]
                    : "UNSPECIFIED");
                const isUpdating = updatingActionId === action.id;

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
                        value={String(getStatus(action))}
                        onValueChange={(v) =>
                          updateActionStatus(
                            action.id,
                            Number(v) as ActionStatus,
                          )
                        }
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="h-8 w-full max-w-[140px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt} value={String(opt)}>
                              {t(
                                `enums.action.status.${ActionStatusNames[opt]}` as
                                  | "enums.action.status.UNSPECIFIED"
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
                      {areaKey !== "UNSPECIFIED" ? (
                        <Badge variant="secondary">
                          {t(`enums.dream.areaOfLife.${areaKey}`)}
                        </Badge>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400 sm:col-span-1">
                      {dueDate
                        ? new Date(dueDate).toLocaleDateString("pt-BR", {
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
                        onClick={() => deleteAction(action.id)}
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
        )}
      </div>

      <NewActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchActions}
      />
    </div>
  );
}
