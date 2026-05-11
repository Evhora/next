"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  CalendarIcon,
  Heart,
  Leaf,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

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
import { Textarea } from "@/shared/ui/textarea";

import {
  type Dream,
  Dream_DreamAreaOfLife,
  Dream_DreamStatus,
} from "../domain/dream";
import {
  DREAM_AREA_OF_LIFE_LABELS,
  SELECTABLE_DREAM_STATUSES,
} from "../domain/labels";

import {
  updateDreamDetailsAction,
  updateDreamStatusAction,
} from "./actions";

interface DreamDetailsDialogProps {
  dream: Dream | null;
  onOpenChange: (open: boolean) => void;
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

const STATUS_DOT: Record<Dream_DreamStatus, string> = {
  [Dream_DreamStatus.UNSPECIFIED]: "bg-muted-foreground",
  [Dream_DreamStatus.IN_PROGRESS]: "bg-amber-400",
  [Dream_DreamStatus.COMPLETED]: "bg-emerald-500",
  [Dream_DreamStatus.PAUSED]: "bg-zinc-400",
};

export function DreamDetailsDialog({
  dream,
  onOpenChange,
}: DreamDetailsDialogProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [deadline, setDeadline] = useState("");
  const [actionPlan, setActionPlan] = useState("");

  useEffect(() => {
    if (dream) {
      setDeadline(dream.deadline);
      setActionPlan(dream.actionPlan);
    }
  }, [dream]);

  const dirty =
    dream !== null &&
    (deadline !== dream.deadline || actionPlan !== dream.actionPlan);

  const handleStatusChange = (next: number) => {
    if (!dream) return;
    startTransition(async () => {
      const result = await updateDreamStatusAction(dream.id, next);
      if (!result.ok) toast.error(result.message);
    });
  };

  const handleSave = () => {
    if (!dream) return;
    startTransition(async () => {
      const result = await updateDreamDetailsAction(
        dream.id,
        deadline,
        actionPlan,
      );
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      onOpenChange(false);
    });
  };

  const AreaIcon = dream ? AREA_ICON[dream.areaOfLife] : null;

  return (
    <Dialog open={dream !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0 overflow-hidden">
        {dream && (
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
                    {dream.title || t("pages.dreams.form.untitled")}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    {t("pages.dreams.details.description")}
                  </DialogDescription>
                  <Badge variant="outline" className="font-normal">
                    {t(
                      `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[dream.areaOfLife]}` as Parameters<
                        typeof t
                      >[0],
                    )}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-5 px-6 py-5">
              <Field label={t("pages.dreams.list.status")}>
                <Select
                  disabled={isPending}
                  value={String(dream.status)}
                  onValueChange={(v) => handleStatusChange(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SELECTABLE_DREAM_STATUSES.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${STATUS_DOT[s]}`}
                          />
                          {statusLabel(s, t)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label={t("pages.dreams.form.deadline")}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      className="w-full justify-start font-normal"
                    >
                      <CalendarIcon className="size-4 text-muted-foreground" />
                      {deadline ? (
                        <span className="tabular-nums">
                          {format(parseISO(deadline), "PPP", { locale: ptBR })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={deadline ? parseISO(deadline) : undefined}
                      onSelect={(date) => {
                        if (date) setDeadline(format(date, "yyyy-MM-dd"));
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </Field>

              <Field label={t("pages.dreams.form.actionPlan")}>
                <Textarea
                  value={actionPlan}
                  disabled={isPending}
                  onChange={(e) => setActionPlan(e.target.value)}
                  rows={6}
                  placeholder={t("pages.dreams.form.describeActionPlan")}
                  className="resize-none"
                />
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
                  ? t("pages.dreams.form.creating")
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

function statusLabel(
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
      return "—";
  }
}
