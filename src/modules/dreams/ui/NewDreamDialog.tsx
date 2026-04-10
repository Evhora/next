"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/shared/ui/textarea";

import {
  DREAM_AREA_OF_LIFE_LABELS,
  DreamAreaOfLife,
  SELECTABLE_DREAM_AREAS_OF_LIFE,
} from "../domain/DreamAreaOfLife";

import { createDreamAction } from "./actions";

interface NewDreamDialogProps {
  trigger: ReactNode;
}

/**
 * Form for creating a new dream. Posts directly to `createDreamAction` via
 * React 19's `useActionState` so we don't have to manage `loading` / `error`
 * by hand. The dialog closes itself once the action returns success.
 *
 * Area of life is uncontrolled (a hidden input is fine because the user can't
 * skip selecting one — the Select sets it). Other fields are uncontrolled too;
 * this keeps the component small and lets the browser do the validation work.
 */
export function NewDreamDialog({ trigger }: NewDreamDialogProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [areaOfLife, setAreaOfLife] = useState<DreamAreaOfLife | "">("");

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
    } else {
      toast.error(state.message);
    }
  }, [state, t]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg">
            {t("pages.dreams.form.title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("pages.dreams.form.description")}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          <input
            type="hidden"
            name="areaOfLife"
            value={areaOfLife === "" ? "" : String(areaOfLife)}
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="area">{t("pages.dreams.form.areaOfLife")}</Label>
              <Select
                value={areaOfLife === "" ? "" : String(areaOfLife)}
                onValueChange={(value) =>
                  setAreaOfLife(Number(value) as DreamAreaOfLife)
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
                      {t(
                        `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[area]}` as
                          | "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP"
                          | "enums.dream.areaOfLife.HEALTH_AND_WELL_BEING"
                          | "enums.dream.areaOfLife.BUSINESS_AND_FINANCE"
                          | "enums.dream.areaOfLife.SPIRITUALITY"
                          | "enums.dream.areaOfLife.LIFESTYLE",
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">
                {t("pages.dreams.form.dreamTitle")} *
              </Label>
              <Input
                id="title"
                name="title"
                required
                type="text"
                placeholder={t("pages.dreams.form.enterDreamTitle")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deadline">
                {t("pages.dreams.form.deadlineDate")} *
              </Label>
              <Input
                id="deadline"
                name="deadline"
                required
                type="date"
                min={today}
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="action_plan">
                {t("pages.dreams.form.actionPlan")} *
              </Label>
              <Textarea
                id="action_plan"
                name="actionPlan"
                required
                rows={4}
                placeholder={t("pages.dreams.form.describeActionPlan")}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 sm:gap-0">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
