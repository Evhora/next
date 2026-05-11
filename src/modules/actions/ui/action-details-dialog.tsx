"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  CalendarIcon,
  Heart,
  Leaf,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Dream_DreamAreaOfLife } from "@/modules/dreams/domain/dream";
import { DREAM_AREA_OF_LIFE_LABELS } from "@/modules/dreams/domain/labels";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import {
  type Action,
  Action_ActionRecurrence,
  Action_ActionStatus,
} from "../domain/action";
import {
  ACTION_RECURRENCE_LABELS,
  ACTION_STATUS_LABELS,
  SELECTABLE_ACTION_RECURRENCES,
  SELECTABLE_ACTION_STATUSES,
} from "../domain/labels";

import {
  updateActionDetailsAction,
  updateActionStatusAction,
} from "./actions";

interface ActionDetailsDialogProps {
  action: Action | null;
  onOpenChange: (open: boolean) => void;
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

export function ActionDetailsDialog({
  action,
  onOpenChange,
}: ActionDetailsDialogProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [recurrence, setRecurrence] = useState<Action_ActionRecurrence>(
    Action_ActionRecurrence.ONCE,
  );
  const [dueDate, setDueDate] = useState<string | null>(null);

  useEffect(() => {
    if (action) {
      setRecurrence(action.recurrence);
      setDueDate(action.dueDate ?? null);
    }
  }, [action]);

  const dirty =
    action !== null &&
    (recurrence !== action.recurrence ||
      (dueDate ?? null) !== (action.dueDate ?? null));

  const handleStatusChange = (next: Action_ActionStatus) => {
    if (!action) return;
    startTransition(async () => {
      const result = await updateActionStatusAction(action.id, next);
      if (!result.ok) toast.error(result.message);
    });
  };

  const handleSave = () => {
    if (!action) return;
    startTransition(async () => {
      const result = await updateActionDetailsAction(
        action.id,
        recurrence,
        dueDate,
      );
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      onOpenChange(false);
    });
  };

  const hasArea =
    action !== null &&
    action.dreamAreaOfLife !== Dream_DreamAreaOfLife.UNSPECIFIED;
  const AreaIcon = action ? AREA_ICON[action.dreamAreaOfLife] : null;

  return (
    <Dialog open={action !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        {action && (
          <>
            <DialogHeader className="border-b bg-muted/30 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                  {AreaIcon ? (
                    <AreaIcon className="size-5 text-foreground" />
                  ) : (
                    <Sparkles className="size-5 text-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <DialogTitle className="truncate text-base">
                    {action.title || t("pages.dreams.form.untitled")}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    {t("pages.actions.details.description")}
                  </DialogDescription>
                  {hasArea && (
                    <Badge variant="outline" className="font-normal">
                      {t(
                        `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[action.dreamAreaOfLife]}` as Parameters<
                          typeof t
                        >[0],
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-5 px-6 py-5">
              <Field label={t("pages.actions.list.status")}>
                <Select
                  disabled={isPending}
                  value={String(action.status)}
                  onValueChange={(v) =>
                    handleStatusChange(Number(v) as Action_ActionStatus)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SELECTABLE_ACTION_STATUSES.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${STATUS_DOT[s]}`}
                          />
                          {t(
                            `enums.action.status.${ACTION_STATUS_LABELS[s]}` as
                              | "enums.action.status.NOT_STARTED"
                              | "enums.action.status.IN_PROGRESS"
                              | "enums.action.status.COMPLETED",
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label={t("pages.actions.list.recurrence")}>
                <Select
                  disabled={isPending}
                  value={String(recurrence)}
                  onValueChange={(v) =>
                    setRecurrence(Number(v) as Action_ActionRecurrence)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SELECTABLE_ACTION_RECURRENCES.map((r) => (
                      <SelectItem key={r} value={String(r)}>
                        {t(
                          `enums.action.recurrence.${ACTION_RECURRENCE_LABELS[r]}` as
                            | "enums.action.recurrence.ONCE"
                            | "enums.action.recurrence.DAILY"
                            | "enums.action.recurrence.WEEKDAYS"
                            | "enums.action.recurrence.WEEKENDS"
                            | "enums.action.recurrence.SPECIAL_DAYS",
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label={t("pages.actions.list.dueDate")}>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        className="flex-1 justify-start font-normal"
                      >
                        <CalendarIcon className="size-4 text-muted-foreground" />
                        {dueDate ? (
                          <span className="tabular-nums">
                            {format(parseISO(dueDate), "PPP", { locale: ptBR })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {t("pages.actions.form.dueDatePlaceholder")}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={dueDate ? parseISO(dueDate) : undefined}
                        onSelect={(date) => {
                          if (date) setDueDate(format(date, "yyyy-MM-dd"));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {dueDate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => setDueDate(null)}
                      aria-label={t("common.cancel")}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </Field>
            </div>

            <DialogFooter className="border-t bg-muted/20 px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                disabled={!dirty || isPending}
                onClick={handleSave}
              >
                {isPending
                  ? t("pages.actions.form.creating")
                  : t("common.save")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
