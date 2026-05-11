"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getActiveSessionAction } from "./actions";

interface BannerData {
  sessionId: string;
  answersCount: number;
  targetAnswers: number;
  hasCandidates: boolean;
}

const DISMISS_KEY = "evhora.discoveryBannerDismissed";

export function ResumeBanner() {
  const t = useTranslations();
  const pathname = usePathname();
  const [data, setData] = useState<BannerData | null>(null);
  const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(
    null,
  );

  // Load dismissed state once.
  useEffect(() => {
    try {
      setDismissedSessionId(window.localStorage.getItem(DISMISS_KEY));
    } catch {
      // localStorage unavailable — treat as never-dismissed.
    }
  }, []);

  // Re-fetch on every navigation so the count stays fresh.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const active = await getActiveSessionAction();
      if (cancelled) return;
      if (!active) {
        setData(null);
        return;
      }
      setData({
        sessionId: active.session.id,
        answersCount: active.answersCount,
        targetAnswers: active.targetAnswers,
        hasCandidates: active.hasCandidates,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!data) return null;
  // Nothing meaningful to resume — empty session, no candidates yet.
  if (data.answersCount === 0 && !data.hasCandidates) return null;
  if (pathname?.startsWith("/dashboard/discovery")) return null;
  if (dismissedSessionId === data.sessionId) return null;

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      window.localStorage.setItem(DISMISS_KEY, data.sessionId);
    } catch {
      // ignore
    }
    setDismissedSessionId(data.sessionId);
  };

  const pct = Math.min(
    100,
    Math.round(
      (data.answersCount / Math.max(1, data.targetAnswers)) * 100,
    ),
  );

  return (
    <div className="relative border-b border-purple-500/20 bg-gradient-to-r from-purple-900/30 via-purple-800/20 to-transparent">
      <Link
        href="/dashboard/discovery"
        className="group block px-4 py-3 pr-12 text-sm transition-colors hover:bg-purple-900/40"
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          {data.hasCandidates ? (
            <Sparkles className="h-4 w-4 shrink-0 text-yellow-300" />
          ) : (
            <Compass className="h-4 w-4 shrink-0 text-purple-300" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-foreground/90 truncate">
              {data.hasCandidates ? (
                <>
                  {t("pages.discovery.resumeBanner.ready")}
                  <span className="font-medium">
                    {t("pages.discovery.resumeBanner.seeCandidates")}
                  </span>
                </>
              ) : (
                <>
                  {t("pages.discovery.resumeBanner.continue")}
                  <span className="font-medium">
                    {t("pages.discovery.resumeBanner.answersProgress", {
                      count: data.answersCount,
                      target: data.targetAnswers,
                    })}
                  </span>
                </>
              )}
            </p>
            {!data.hasCandidates && (
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-purple-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>

          <span className="text-purple-200 group-hover:text-white transition-colors flex items-center gap-1 shrink-0">
            {t("pages.discovery.resumeBanner.continueLabel")}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={dismiss}
        aria-label={t("pages.discovery.resumeBanner.dismiss")}
        title={t("pages.discovery.resumeBanner.dismiss")}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-purple-200/60 hover:bg-white/10 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
