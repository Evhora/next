"use client";

import { ListChecks } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import type { Dream_DreamAreaOfLife } from "@/modules/dreams/domain/dream";
import { DREAM_AREA_OF_LIFE_LABELS } from "@/modules/dreams/domain/labels";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { Action_ActionRecurrence } from "../domain/action";
import {
  ACTION_RECURRENCE_LABELS,
  SELECTABLE_ACTION_RECURRENCES,
} from "../domain/labels";

import { createActionAction } from "./actions";

export interface DreamOption {
  id: string;
  title: string;
  areaOfLife: Dream_DreamAreaOfLife;
}

interface NewActionDialogProps {
  trigger: ReactNode;
  dreams: DreamOption[];
}

const NO_DREAM = "__none__";

const AREA_ICON: Record<Dream_DreamAreaOfLife, string> = {
  0: "·",   // UNSPECIFIED
  1: "👨‍👩‍👧‍👦", // FAMILY_AND_RELANTIONSHIP
  2: "💪",  // HEALTH_AND_WELL_BEING
  3: "💼",  // BUSINESS_AND_FINANCE
  4: "🧘",  // SPIRITUALITY
  5: "✨",  // LIFESTYLE
};

export function NewActionDialog({ trigger, dreams }: NewActionDialogProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [recurrence, setRecurrence] = useState<Action_ActionRecurrence>(
    Action_ActionRecurrence.ONCE,
  );
  const [dreamId, setDreamId] = useState<string>(NO_DREAM);

  const [state, formAction, isPending] = useActionState(
    createActionAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(t("pages.actions.form.created"));
      setOpen(false);
      setRecurrence(Action_ActionRecurrence.ONCE);
      setDreamId(NO_DREAM);
    } else {
      toast.error(state.message);
    }
  }, [state, t]);

  const selectedDream =
    dreamId === NO_DREAM ? null : dreams.find((d) => d.id === dreamId) ?? null;
  const dreamAreaOfLife =
    selectedDream == null ? "" : String(selectedDream.areaOfLife);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-zinc-200 bg-white p-0 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="border-b border-zinc-100 px-7 pb-6 pt-7 dark:border-zinc-800">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
            {t("pages.actions.form.description")}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <ListChecks className="h-7 w-7 text-zinc-900 dark:text-zinc-50" />
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t("pages.actions.form.title")}
            </h2>
          </div>
        </div>

        {/* Form */}
        <form action={formAction} className="px-7 pb-7 pt-6">
          <input type="hidden" name="recurrence" value={recurrence} />
          <input
            type="hidden"
            name="dreamId"
            value={dreamId === NO_DREAM ? "" : dreamId}
          />
          <input type="hidden" name="dreamAreaOfLife" value={dreamAreaOfLife} />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Title — full width */}
            <div className="grid gap-2 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                {t("pages.actions.form.actionTitle")} *
              </Label>
              <Input
                id="action-title"
                name="title"
                type="text"
                required
                placeholder={t("pages.actions.form.actionTitlePlaceholder")}
              />
            </div>

            {/* Recurrence */}
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                {t("pages.actions.form.recurrence")} *
              </Label>
              <Select
                value={String(recurrence)}
                onValueChange={(value) => setRecurrence(Number(value))}
              >
                <SelectTrigger id="recurrence-select" className="w-full">
                  <SelectValue
                    placeholder={t("pages.actions.form.selectRecurrence")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {SELECTABLE_ACTION_RECURRENCES.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {t(
                        `enums.action.recurrence.${ACTION_RECURRENCE_LABELS[opt]}` as
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
            </div>

            {/* Due date */}
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                {t("pages.actions.form.dueDate")}
              </Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>

            {/* Dream — full width */}
            <div className="grid gap-2 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                {t("pages.actions.form.dream")}
              </Label>
              <Select value={dreamId} onValueChange={setDreamId}>
                <SelectTrigger id="dream-select" className="w-full">
                  <SelectValue
                    placeholder={t("pages.actions.form.selectDream")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DREAM}>—</SelectItem>
                  {dreams.map((dream) => (
                    <SelectItem key={dream.id} value={dream.id}>
                      <span className="flex items-center gap-2">
                        <span>{AREA_ICON[dream.areaOfLife]}</span>
                        {dream.title || t("pages.dreams.form.untitled")}
                        {` — ${t(
                          `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[dream.areaOfLife]}` as
                            | "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP"
                            | "enums.dream.areaOfLife.HEALTH_AND_WELL_BEING"
                            | "enums.dream.areaOfLife.BUSINESS_AND_FINANCE"
                            | "enums.dream.areaOfLife.SPIRITUALITY"
                            | "enums.dream.areaOfLife.LIFESTYLE",
                        )}`}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-7 flex justify-end gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? t("pages.actions.form.creating")
                : t("pages.actions.form.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
