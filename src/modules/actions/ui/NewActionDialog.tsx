"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  DREAM_AREA_OF_LIFE_LABELS,
  type DreamAreaOfLife,
} from "@/modules/dreams/domain/DreamAreaOfLife";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

import {
  ACTION_RECURRENCE_LABELS,
  ActionRecurrence,
  SELECTABLE_ACTION_RECURRENCES,
} from "../domain/ActionRecurrence";

import { createActionAction } from "./actions";

export interface DreamOption {
  id: string;
  title: string;
  areaOfLife: DreamAreaOfLife;
}

interface NewActionDialogProps {
  trigger: ReactNode;
  dreams: DreamOption[];
}

const NO_DREAM = "__none__";

export function NewActionDialog({ trigger, dreams }: NewActionDialogProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [recurrence, setRecurrence] = useState<ActionRecurrence>(
    ActionRecurrence.ONCE,
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
      setRecurrence(ActionRecurrence.ONCE);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t("pages.actions.form.title")}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="recurrence" value={recurrence} />
          <input
            type="hidden"
            name="dreamId"
            value={dreamId === NO_DREAM ? "" : dreamId}
          />
          <input type="hidden" name="dreamAreaOfLife" value={dreamAreaOfLife} />

          <div className="grid gap-2">
            <Label htmlFor="action-title">
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

          <div className="grid gap-2">
            <Label htmlFor="dueDate">{t("pages.actions.form.dueDate")}</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recurrence-select">
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

          <div className="grid gap-2">
            <Label htmlFor="dream-select">
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
                    {dream.title || t("pages.dreams.form.untitled")}
                    {` — ${t(
                      `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[dream.areaOfLife]}` as
                        | "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP"
                        | "enums.dream.areaOfLife.HEALTH_AND_WELL_BEING"
                        | "enums.dream.areaOfLife.BUSINESS_AND_FINANCE"
                        | "enums.dream.areaOfLife.SPIRITUALITY"
                        | "enums.dream.areaOfLife.LIFESTYLE",
                    )}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-4 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending
                ? t("pages.actions.form.creating")
                : t("pages.actions.form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
