"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Dream_DreamAreaOfLife } from "@/modules/dreams/domain/dream";
import {
  DREAM_AREA_OF_LIFE_LABELS,
  SELECTABLE_DREAM_AREAS_OF_LIFE,
} from "@/modules/dreams/domain/labels";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { generateDreamImageAction } from "./actions";

export interface DreamOption {
  id: string;
  title: string;
  areaOfLife: Dream_DreamAreaOfLife;
}

interface DreamBoardClientProps {
  dreams: DreamOption[];
}

type SelectedSlots = Record<Dream_DreamAreaOfLife, [string | null, string | null]>;

const NO_DREAM = "__none__";
const ROTATIONS = [-4, 2, -3, 1, 3, -2, 4, -1, 2, -3];

const emptySelection = (): SelectedSlots => {
  const init = {} as SelectedSlots;
  for (const area of SELECTABLE_DREAM_AREAS_OF_LIFE) init[area] = [null, null];
  return init;
};

export function DreamBoardClient({ dreams }: DreamBoardClientProps) {
  const t = useTranslations();
  const [selected, setSelected] = useState<SelectedSlots>(emptySelection);
  const [imageByDreamId, setImageByDreamId] = useState<Record<string, string>>(
    {},
  );
  const [isGenerating, startGenerating] = useTransition();
  const boardRef = useRef<HTMLDivElement>(null);

  const dreamsByArea = dreams.reduce<Record<string, DreamOption[]>>(
    (acc, dream) => {
      (acc[dream.areaOfLife] ??= []).push(dream);
      return acc;
    },
    {},
  );

  const fetchImageForDream = useCallback(
    (dreamId: string, title: string) => {
      if (imageByDreamId[dreamId]) return;
      startGenerating(async () => {
        const result = await generateDreamImageAction(title || "dream goal");
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        setImageByDreamId((prev) => ({ ...prev, [dreamId]: result.data.url }));
      });
    },
    [imageByDreamId],
  );

  const handleSelectDream = (
    area: Dream_DreamAreaOfLife,
    slot: 0 | 1,
    value: string,
  ) => {
    const dreamId = value === NO_DREAM ? null : value;
    setSelected((prev) => {
      const next = { ...prev };
      const pair = [...next[area]] as [string | null, string | null];
      pair[slot] = dreamId;
      next[area] = pair;
      return next;
    });
    if (dreamId) {
      const dream = dreams.find((d) => d.id === dreamId);
      if (dream) fetchImageForDream(dreamId, dream.title);
    }
  };

  const boardItems = useMemo(() => {
    const items: { dreamId: string; title: string; url: string }[] = [];
    for (const area of SELECTABLE_DREAM_AREAS_OF_LIFE) {
      for (const dreamId of selected[area]) {
        if (!dreamId) continue;
        const url = imageByDreamId[dreamId];
        if (!url) continue;
        const dream = dreams.find((d) => d.id === dreamId);
        items.push({ dreamId, title: dream?.title ?? "", url });
      }
    }
    return items;
  }, [selected, imageByDreamId, dreams]);

  const downloadAsImage = useCallback(() => {
    if (boardItems.length === 0) return;
    const canvas = document.createElement("canvas");
    const width = 1000;
    const height = 700;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, width, height);

    const imgW = 320;
    const imgH = 240;
    const overlap = 50;
    const stepX = imgW - overlap;
    const stepY = imgH - overlap;
    const cols = 3;

    const loadImage = (url: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });

    (async () => {
      for (let i = 0; i < boardItems.length; i++) {
        const item = boardItems[i];
        try {
          const img = await loadImage(item.url);
          const col = i % cols;
          const row = Math.floor(i / cols);
          let x = col * stepX + (row % 2) * 20;
          let y = row * stepY;
          x = Math.max(0, Math.min(x, width - imgW));
          y = Math.max(0, Math.min(y, height - imgH));
          const rot = (ROTATIONS[i] ?? 0) * (Math.PI / 180);
          ctx.save();
          ctx.translate(x + imgW / 2, y + imgH / 2);
          ctx.rotate(rot);
          ctx.translate(-imgW / 2, -imgH / 2);
          ctx.drawImage(img, 0, 0, imgW, imgH);
          ctx.restore();
        } catch {
          // skip failed images
        }
      }
      const link = document.createElement("a");
      link.download = "dream-board.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    })();
  }, [boardItems]);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SELECTABLE_DREAM_AREAS_OF_LIFE.map((area) => {
          const areaDreams = dreamsByArea[area] ?? [];
          const pair = selected[area];
          return (
            <Card key={area}>
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold text-foreground">
                  {t(
                    `enums.dream.areaOfLife.${DREAM_AREA_OF_LIFE_LABELS[area]}` as
                      | "enums.dream.areaOfLife.FAMILY_AND_RELANTIONSHIP"
                      | "enums.dream.areaOfLife.HEALTH_AND_WELL_BEING"
                      | "enums.dream.areaOfLife.BUSINESS_AND_FINANCE"
                      | "enums.dream.areaOfLife.SPIRITUALITY"
                      | "enums.dream.areaOfLife.LIFESTYLE",
                  )}
                </h3>
                <div className="space-y-2">
                  {([0, 1] as const).map((slot) => (
                    <div key={slot} className="flex items-center gap-2">
                      <label className="w-16 shrink-0 text-sm text-zinc-600 dark:text-zinc-400">
                        {t("pages.dreamBoard.selectDream", { slot: slot + 1 })}
                      </label>
                      <Select
                        value={pair[slot] ?? NO_DREAM}
                        onValueChange={(v) => handleSelectDream(area, slot, v)}
                      >
                        <SelectTrigger className="h-9 flex-1">
                          <SelectValue
                            placeholder={t("pages.dreamBoard.noDream")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_DREAM}>
                            {t("pages.dreamBoard.noDream")}
                          </SelectItem>
                          {areaDreams.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.title || t("pages.dreams.form.untitled")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isGenerating && (
        <p className="text-sm text-zinc-500">
          {t("pages.dreamBoard.loadingImage")}
        </p>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {t("pages.dreamBoard.title")}
          </h2>
          {boardItems.length > 0 && (
            <Button onClick={downloadAsImage}>
              {t("pages.dreamBoard.downloadImage")}
            </Button>
          )}
        </div>

        {boardItems.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[280px] items-center justify-center p-8 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                {t("pages.dreamBoard.noImagesYet")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div
            ref={boardRef}
            className="relative flex min-h-[400px] flex-wrap content-start gap-0 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50"
            style={{ padding: "20px" }}
          >
            {boardItems.map((item, i) => (
              <div
                key={`board-${i}-${item.dreamId}`}
                className="overflow-hidden rounded-lg border-2 border-white shadow-lg dark:border-zinc-800"
                style={{
                  width: "220px",
                  height: "165px",
                  margin: "-18px",
                  transform: `rotate(${ROTATIONS[i] ?? 0}deg)`,
                  zIndex: i + 1,
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
