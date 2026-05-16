"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  Heart,
  Leaf,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/shared/ui/textarea";

import { Dream_DreamAreaOfLife } from "../domain/dream";
import {
  DREAM_AREA_OF_LIFE_LABELS,
  SELECTABLE_DREAM_AREAS_OF_LIFE,
} from "../domain/labels";

import { createDreamAction } from "./actions";

const AREA_ICON: Record<Dream_DreamAreaOfLife, LucideIcon | null> = {
  [Dream_DreamAreaOfLife.UNSPECIFIED]: null,
  [Dream_DreamAreaOfLife.SPIRITUALITY]: Leaf,
  [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: Users,
  [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: Heart,
  [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: Briefcase,
  [Dream_DreamAreaOfLife.LIFESTYLE]: Sparkles,
  [Dream_DreamAreaOfLife.TRAINING_AND_EDUCATION]: BookOpen,
};

interface NewDreamDialogProps {
  trigger: ReactNode;
  onCreated?: (dreamId: string) => void;
}

export function NewDreamDialog({ trigger, onCreated }: NewDreamDialogProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [areaOfLife, setAreaOfLife] = useState<Dream_DreamAreaOfLife | "">("");

  const [state, formAction, isPending] = useActionState(
    createDreamAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(t("pages.dreams.form.created"));
      setOpen(false);
      setAreaOfLife("");
      onCreated?.(state.data.id);
    } else {
      toast.error(state.message);
    }
  }, [state, t]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-zinc-200 bg-white p-0 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="border-b border-zinc-100 px-7 pb-6 pt-7 dark:border-zinc-800">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
            {t("pages.dreams.form.description")}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Target className="h-7 w-7 text-zinc-900 dark:text-zinc-50" />
            <DialogTitle className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t("pages.dreams.form.title")}
            </DialogTitle>
          </div>
        </div>

        {/* Form */}
        <form action={formAction} className="px-7 pb-7 pt-6">
          <input
            type="hidden"
            name="areaOfLife"
            value={areaOfLife === "" ? "" : String(areaOfLife)}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Area of life — full width */}
            <div className="grid gap-2 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                {t("pages.dreams.form.areaOfLife")}
              </Label>
              <Select
                value={areaOfLife === "" ? "" : String(areaOfLife)}
                onValueChange={(value) =>
                  setAreaOfLife(Number(value) as Dream_DreamAreaOfLife)
                }
              >
                <SelectTrigger id="area" className="w-full">
                  <SelectValue
                    placeholder={t("pages.dreams.form.selectAreaOfLife")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {SELECTABLE_DREAM_AREAS_OF_LIFE.map((area) => (
                    <SelectItem key={area} value={String(area)}>
                      <span className="flex items-center gap-2">
                        {(() => {
                          const I = AREA_ICON[area];
                          return I ? <I className="h-3.5 w-3.5" /> : null;
                        })()}
                        {t(
                          `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[area]}` as
                            | "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP"
                            | "enums.dream.areaOfLife.HEALTH_AND_WELL_BEING"
                            | "enums.dream.areaOfLife.BUSINESS_AND_FINANCE"
                            | "enums.dream.areaOfLife.SPIRITUALITY"
                            | "enums.dream.areaOfLife.LIFESTYLE"
                            | "enums.dream.areaOfLife.CAPACITACAO_E_EDUCACAO",
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {t("pages.dreams.form.areaOfLifeHint")}
              </p>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                {t("pages.dreams.form.dreamTitle")} *
              </Label>
              <Input
                id="title"
                name="title"
                required
                type="text"
                placeholder={t("pages.dreams.form.enterDreamTitle")}
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {t("pages.dreams.form.dreamTitleHint")}
              </p>
            </div>

            {/* Deadline */}
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                {t("pages.dreams.form.deadlineDate")} *
              </Label>
              <Input
                id="deadline"
                name="deadline"
                required
                type="date"
                min={today}
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {t("pages.dreams.form.deadlineHint")}
              </p>
            </div>

            {/* Action plan — full width */}
            <div className="grid gap-2 sm:col-span-2">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                {t("pages.dreams.form.actionPlan")} *
              </Label>
              <Textarea
                id="action_plan"
                name="actionPlan"
                required
                rows={4}
                placeholder={t("pages.dreams.form.describeActionPlan")}
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {t("pages.dreams.form.actionPlanHint")}
              </p>
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
            <Button type="submit" disabled={isPending || !areaOfLife}>
              {isPending
                ? t("pages.dreams.form.creating")
                : t("pages.dreams.form.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
