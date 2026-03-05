"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DreamAreaOfLife } from "@/lib/domain/enums/dream";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

const AREAS = [
  DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP,
  DreamAreaOfLife.HEALTH_AND_WELL_BEING,
  DreamAreaOfLife.BUSINESS_AND_FINANCE,
  DreamAreaOfLife.SPIRITUALITY,
  DreamAreaOfLife.LIFESTYLE,
] as const;

type DreamFromApi = {
  id: string;
  title?: string;
  areaOfLife?: string;
  area_of_life?: number;
};

type SelectedDreams = Record<string, [string | null, string | null]>;

const ROTATIONS = [-4, 2, -3, 1, 3, -2, 4, -1, 2, -3];

export default function DreamBoardPage() {
  const t = useTranslations();
  const [dreams, setDreams] = useState<DreamFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDreams, setSelectedDreams] = useState<SelectedDreams>(() => {
    const init: SelectedDreams = {};
    AREAS.forEach((a) => {
      init[DreamAreaOfLife[a]] = [null, null];
    });
    return init;
  });
  const [imageByDreamId, setImageByDreamId] = useState<Record<string, string>>(
    {},
  );
  const [loadingImageId, setLoadingImageId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/dreams")
      .then((res) => res.json())
      .then((data) => setDreams(data.dreams ?? []))
      .catch(() => setDreams([]))
      .finally(() => setLoading(false));
  }, []);

  const dreamsByArea = dreams.reduce<Record<string, DreamFromApi[]>>(
    (acc, dream) => {
      const area =
        dream.areaOfLife ??
        (dream.area_of_life != null
          ? DreamAreaOfLife[dream.area_of_life]
          : null);
      if (area && area !== "UNSPECIFIED") {
        if (!acc[area]) acc[area] = [];
        acc[area].push(dream);
      }
      return acc;
    },
    {},
  );

  const fetchImageForDream = useCallback(
    async (dreamId: string, title: string) => {
      if (imageByDreamId[dreamId]) return;
      setLoadingImageId(dreamId);
      try {
        const res = await fetch("/api/dream-board/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: title || "dream goal" }),
        });
        const data = await res.json();
        if (data.url) {
          setImageByDreamId((prev) => ({ ...prev, [dreamId]: data.url }));
        }
      } finally {
        setLoadingImageId(null);
      }
    },
    [imageByDreamId],
  );

  const handleSelectDream = (
    areaKey: string,
    slot: 0 | 1,
    dreamId: string | null,
  ) => {
    setSelectedDreams((prev) => {
      const next = { ...prev };
      const pair = [...(next[areaKey] ?? [null, null])];
      pair[slot] = dreamId;
      next[areaKey] = pair as [string | null, string | null];
      return next;
    });
    if (dreamId) {
      const dream = dreams.find((d) => d.id === dreamId);
      if (dream) fetchImageForDream(dreamId, dream.title ?? "");
    }
  };

  const boardItems: { dreamId: string; title: string; url: string }[] = [];
  AREAS.forEach((areaEnum) => {
    const areaKey = DreamAreaOfLife[areaEnum];
    const pair = selectedDreams[areaKey] ?? [null, null];
    pair.forEach((dreamId) => {
      if (!dreamId) return;
      const url = imageByDreamId[dreamId];
      if (!url) return;
      const dream = dreams.find((d) => d.id === dreamId);
      boardItems.push({
        dreamId,
        title: dream?.title ?? "",
        url,
      });
    });
  });

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

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-zinc-600 dark:text-zinc-400">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("pages.dreamBoard.title")}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t("pages.dreamBoard.description")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((areaEnum) => {
            const areaKey = DreamAreaOfLife[areaEnum];
            const areaDreams = dreamsByArea[areaKey] ?? [];
            const pair = selectedDreams[areaKey] ?? [null, null];
            const areaLabel = t(
              `enums.dream.areaOfLife.${areaKey}` as "enums.dream.areaOfLife.LIFESTYLE",
            );

            return (
              <Card key={areaKey}>
                <CardContent className="p-4">
                  <h3 className="mb-3 font-semibold text-foreground">
                    {areaLabel}
                  </h3>
                  <div className="space-y-2">
                    {([0, 1] as const).map((slot) => (
                      <div key={slot} className="flex items-center gap-2">
                        <label className="w-16 shrink-0 text-sm text-zinc-600 dark:text-zinc-400">
                          {t("pages.dreamBoard.selectDream", {
                            slot: slot + 1,
                          })}
                        </label>
                        <Select
                          value={pair[slot] ?? ""}
                          onValueChange={(v) =>
                            handleSelectDream(areaKey, slot, v || null)
                          }
                        >
                          <SelectTrigger className="h-9 flex-1">
                            <SelectValue
                              placeholder={t("pages.dreamBoard.noDream")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">
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

        {loadingImageId && (
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
      </div>
    </div>
  );
}
