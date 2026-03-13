"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { ActionRecurrence } from "@/lib/domain/enums/action";
import {
  DreamAreaOfLife,
  DreamAreaOfLifeByLabel,
} from "@/lib/domain/enums/dream";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";

interface DreamOption {
  id: string;
  title?: string;
  areaOfLife?: string;
  area_of_life?: number;
}

interface NewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RECURRENCE_OPTIONS: { value: ActionRecurrence; labelKey: string }[] = [
  { value: ActionRecurrence.ONCE, labelKey: "ONCE" },
  { value: ActionRecurrence.DAILY, labelKey: "DAILY" },
  { value: ActionRecurrence.WEEKDAYS, labelKey: "WEEKDAYS" },
  { value: ActionRecurrence.WEEKENDS, labelKey: "WEEKENDS" },
  { value: ActionRecurrence.SPECIAL_DAYS, labelKey: "SPECIAL_DAYS" },
];

export function NewActionModal({
  isOpen,
  onClose,
  onSuccess,
}: NewActionModalProps) {
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dreams, setDreams] = useState<DreamOption[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    due_date: "",
    recurrence: ActionRecurrence.ONCE,
    dream_id: "" as string,
  });

  useEffect(() => {
    if (isOpen) {
      fetch("/api/dreams")
        .then((res) => res.json())
        .then((data) => setDreams(data.dreams ?? []))
        .catch(() => setDreams([]));
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const selectedDream = formData.dream_id
        ? dreams.find((d) => d.id === formData.dream_id)
        : null;
      const area_of_life_value =
        selectedDream?.area_of_life ??
        (selectedDream?.areaOfLife
          ? (DreamAreaOfLifeByLabel[selectedDream.areaOfLife] ?? null)
          : null);

      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          due_date: formData.due_date,
          recurrence: formData.recurrence,
          dream_id: formData.dream_id || null,
          area_of_life: area_of_life_value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("common.error"));
      }

      setFormData({
        title: "",
        due_date: "",
        recurrence: ActionRecurrence.ONCE,
        dream_id: "",
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const areaKey = (dream: DreamOption): string =>
    dream.areaOfLife ??
    (dream.area_of_life != null
      ? (DreamAreaOfLife[dream.area_of_life] ?? "UNSPECIFIED")
      : "UNSPECIFIED");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t("pages.actions.form.title")}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="action-title">
              {t("pages.actions.form.actionTitle")} *
            </Label>
            <Input
              id="action-title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder={t("pages.actions.form.actionTitlePlaceholder")}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="due_date">{t("pages.actions.form.dueDate")}</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recurrence">
              {t("pages.actions.form.recurrence")} *
            </Label>
            <Select
              value={String(formData.recurrence)}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  recurrence: Number(value),
                })
              }
            >
              <SelectTrigger id="recurrence" className="w-full">
                <SelectValue
                  placeholder={t("pages.actions.form.selectRecurrence")}
                />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {t(`enums.action.recurrence.${opt.labelKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dream_id">{t("pages.actions.form.dream")}</Label>
            <Select
              value={formData.dream_id}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  dream_id: value,
                })
              }
            >
              <SelectTrigger id="dream_id" className="w-full">
                <SelectValue
                  placeholder={t("pages.actions.form.selectDream")}
                />
              </SelectTrigger>
              <SelectContent>
                {dreams.map((dream) => (
                  <SelectItem key={dream.id} value={dream.id}>
                    {dream.title || t("pages.dreams.form.untitled")}
                    {areaKey(dream) !== "UNSPECIFIED" &&
                      ` — ${t(
                        `enums.dream.areaOfLife.${areaKey(
                          dream,
                        )}` as "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP",
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
              onClick={onClose}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title}
              className="flex-1"
            >
              {loading
                ? t("pages.actions.form.creating")
                : t("pages.actions.form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
