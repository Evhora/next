"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DreamAreaOfLife,
  DreamAreaOfLifeNames,
} from "@/lib/domain/enums/dream";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { Textarea } from "../ui/textarea";

interface NewDreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewDreamModal({
  isOpen,
  onClose,
  onSuccess,
}: NewDreamModalProps) {
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    areaOfLife: DreamAreaOfLife.UNSPECIFIED,
    deadline: "",
    actionPlan: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/dreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("common.error"));
      }

      setFormData({
        title: "",
        areaOfLife: DreamAreaOfLife.UNSPECIFIED,
        deadline: "",
        actionPlan: "",
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg">
            {t("pages.dreams.form.title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("pages.dreams.form.description")}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive dark:bg-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="area">{t("pages.dreams.form.areaOfLife")}</Label>
              <Select
                value={String(formData.areaOfLife)}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    areaOfLife: Number(value),
                  })
                }
              >
                <SelectTrigger id="area" className="w-full">
                  <SelectValue
                    placeholder={t("pages.dreams.form.selectAreaOfLife")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DreamAreaOfLifeNames).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {t(`enums.dream.areaOfLife.${value}`)}
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
                required
                type="text"
                placeholder={t("pages.dreams.form.enterDreamTitle")}
                value={formData.title}
                onChange={(event) =>
                  setFormData({ ...formData, title: event.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deadline">
                {t("pages.dreams.form.deadlineDate")} *
              </Label>
              <Input
                id="deadline"
                required
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.deadline}
                onChange={(event) =>
                  setFormData({ ...formData, deadline: event.target.value })
                }
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="action_plan">
                {t("pages.dreams.form.actionPlan")} *
              </Label>
              <Textarea
                id="action_plan"
                required
                rows={4}
                placeholder={t("pages.dreams.form.describeActionPlan")}
                value={formData.actionPlan}
                onChange={(event) =>
                  setFormData({ ...formData, actionPlan: event.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.title ||
                !formData.areaOfLife ||
                !formData.deadline ||
                !formData.actionPlan
              }
            >
              {loading
                ? t("pages.dreams.form.creating")
                : t("pages.dreams.form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
