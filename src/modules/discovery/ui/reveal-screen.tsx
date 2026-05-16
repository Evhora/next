"use client";

import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import type { DreamCandidate } from "../proto/v1/session_pb";
import { selectCandidatesAction } from "./actions";

const AREA_KEYS: Record<number, string> = {
  1: "FAMILY_AND_RELANTIONSHIP",
  2: "HEALTH_AND_WELL_BEING",
  3: "BUSINESS_AND_FINANCE",
  4: "SPIRITUALITY",
  5: "LIFESTYLE",
};

interface RevealScreenProps {
  candidates: DreamCandidate[];
  sessionId: string;
  onSelected: () => void;
  onError: (message: string, code?: string) => void;
}

export function RevealScreen({
  candidates,
  sessionId,
  onSelected,
  onError,
}: RevealScreenProps) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(candidates.map((c) => c.id)));

  const submit = () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    startTransition(async () => {
      const result = await selectCandidatesAction({
        sessionId,
        candidateIds: ids,
      });
      if (result.ok) {
        onSelected();
      } else {
        onError(result.message, result.code);
      }
    });
  };

  const allSelected = selected.size === candidates.length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Sparkles className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
        <h2 className="text-2xl font-serif text-white">
          {t("pages.discovery.reveal.title")}
        </h2>
        <p className="text-white/50 text-sm mt-1">
          {t("pages.discovery.reveal.subtitle")}
        </p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {candidates.map((candidate, i) => {
          const isSelected = selected.has(candidate.id);
          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              onClick={() => toggle(candidate.id)}
              className={[
                "border rounded-2xl p-5 backdrop-blur-sm cursor-pointer transition-all duration-200",
                isSelected
                  ? "bg-white/20 border-white/50 shadow-lg shadow-white/5"
                  : "bg-white/10 border-white/20 hover:bg-white/15",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/30" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-white/40 text-xs">
                    {AREA_KEYS[candidate.areaOfLife]
                      ? t(
                          `enums.dream.areaOfLife.${AREA_KEYS[candidate.areaOfLife]}`,
                        )
                      : t("pages.discovery.reveal.areaGeneral")}
                  </span>
                  <h3 className="text-white font-semibold text-lg leading-tight mt-0.5">
                    {candidate.title}
                  </h3>
                  <p className="text-white/60 text-sm mt-1">
                    {candidate.description}
                  </p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                      <span>{t("pages.discovery.reveal.confidence")}</span>
                      <span>{Math.round(candidate.confidence * 100)}%</span>
                    </div>
                    <Progress
                      value={candidate.confidence * 100}
                      className="h-1.5 bg-white/10"
                    />
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(expanded === i ? null : i);
                      }}
                      className="text-white/40 hover:text-white/60 text-xs flex items-center gap-1 transition-colors"
                    >
                      {expanded === i ? (
                        <>
                          <ChevronUp className="w-3 h-3" />{" "}
                          {t("pages.discovery.reveal.hideEvidence")}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />{" "}
                          {t("pages.discovery.reveal.showEvidence", {
                            count: candidate.evidence.length,
                          })}
                        </>
                      )}
                    </button>

                    {expanded === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 space-y-3 border-t border-white/10 pt-3"
                      >
                        {candidate.evidence.map((ev, j) => (
                          <div key={j} className="text-sm">
                            <blockquote className="text-white/70 italic border-l-2 border-white/30 pl-3">
                              &ldquo;{ev.userQuote}&rdquo;
                            </blockquote>
                            <p className="text-white/40 text-xs mt-1">
                              {ev.whyRelevant}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 pt-2">
        {!allSelected && (
          <button
            type="button"
            onClick={selectAll}
            className="text-white/50 hover:text-white/80 text-sm underline underline-offset-2 transition-colors text-center"
          >
            {t("pages.discovery.reveal.addAll")}
          </button>
        )}

        <Button
          onClick={submit}
          disabled={isPending || selected.size === 0}
          className="bg-white text-black hover:bg-white/90 w-full gap-2"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : selected.size === 0 ? (
            t("pages.discovery.reveal.selectAtLeastOne")
          ) : selected.size === candidates.length ? (
            t("pages.discovery.reveal.addAll")
          ) : selected.size === 1 ? (
            t("pages.discovery.reveal.addOne")
          ) : (
            t("pages.discovery.reveal.addMany", { count: selected.size })
          )}
        </Button>
      </div>
    </div>
  );
}
