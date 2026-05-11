"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useTransition } from "react";
import type { AnswerQuestionResult } from "../application/answer-question";
import type { StartSessionResult } from "../application/start-session";
import type { Question } from "../proto/v1/question_pb";
import { Phase, type DreamArcheologySession } from "../proto/v1/session_pb";
import { startOverAction, synthesizeAction } from "./actions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { PaywallGate } from "./paywall-gate";
import { ProgressDots } from "./progress-dots";
import { QuestionCard } from "./question-card";
import { RestartConfirmDialog } from "./restart-confirm-dialog";
import { RevealScreen } from "./reveal-screen";
import { ShadowSaved } from "./shadow-saved";
import { SynthesisLoader } from "./synthesis-loader";

const PHASE_GRADIENTS: Record<number, string> = {
  [Phase.CHILDHOOD]: "from-amber-900 via-amber-800 to-amber-950",
  [Phase.ENVY]: "from-emerald-900 via-emerald-800 to-emerald-950",
  [Phase.ENERGY]: "from-orange-900 via-orange-800 to-orange-950",
  [Phase.MONEY]: "from-yellow-900 via-yellow-800 to-yellow-950",
  [Phase.PAIN]: "from-rose-900 via-rose-800 to-rose-950",
  [Phase.DEATH]: "from-purple-900 via-purple-800 to-purple-950",
};

type QuizStage =
  | { kind: "question"; question: Question; session: DreamArcheologySession }
  | { kind: "synthesizing"; session: DreamArcheologySession }
  | { kind: "reveal"; session: DreamArcheologySession }
  | { kind: "done" }
  | { kind: "paywall" }
  | { kind: "error"; message: string };

const stageFromInitial = (initial: StartSessionResult): QuizStage => {
  if (initial.kind === "question") {
    return {
      kind: "question",
      question: initial.nextQuestion,
      session: initial.session,
    };
  }
  if (initial.kind === "reveal") {
    return { kind: "reveal", session: initial.session };
  }
  return { kind: "synthesizing", session: initial.session };
};

interface QuizShellProps {
  initial: StartSessionResult;
}

export function QuizShell({ initial }: QuizShellProps) {
  const t = useTranslations();
  const [stage, setStage] = useState<QuizStage>(() => stageFromInitial(initial));
  const [, startTransition] = useTransition();
  const [isRestarting, startRestart] = useTransition();
  const [restartOpen, setRestartOpen] = useState(false);
  const router = useRouter();

  // Show a one-time "resuming" hint when the initial session already had answers.
  const resumedFrom =
    initial.kind === "question" && initial.session.answers.length > 0
      ? initial.session.answers.length
      : initial.kind === "resume_synthesis" || initial.kind === "reveal"
        ? initial.session.answers.length
        : 0;
  const [showResumedHint, setShowResumedHint] = useState(resumedFrom > 0);
  useEffect(() => {
    if (!showResumedHint) return;
    const timer = setTimeout(() => setShowResumedHint(false), 4000);
    return () => clearTimeout(timer);
  }, [showResumedHint]);

  const confirmStartOver = () => {
    startRestart(async () => {
      const result = await startOverAction();
      if (!result.ok) {
        setRestartOpen(false);
        handleError(result.message, result.code);
        return;
      }
      // Hard reload — `router.refresh()` would re-render the page, but
      // QuizShell's local `stage` state would persist and keep showing the
      // old session. A full navigation forces a fresh mount with the new
      // session returned by startSession on the server.
      window.location.href = "/dashboard/discovery";
    });
  };

  const currentAnswersCount =
    stage.kind === "question" ||
    stage.kind === "synthesizing" ||
    stage.kind === "reveal"
      ? stage.session.answers.length
      : 0;

  const runSynthesis = (session: DreamArcheologySession) => {
    setStage({ kind: "synthesizing", session });
    startTransition(async () => {
      const synthResult = await synthesizeAction(session.id);
      if (synthResult.ok) {
        setStage({ kind: "reveal", session: synthResult.data.session });
      } else if (synthResult.code === "QUOTA_EXCEEDED") {
        setStage({ kind: "paywall" });
      } else {
        setStage({ kind: "error", message: synthResult.message });
      }
    });
  };

  // Auto-fire synth if we resumed mid-flow.
  useEffect(() => {
    if (initial.kind === "resume_synthesis") {
      runSynthesis(initial.session);
    }
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPhase =
    stage.kind === "question" ||
    stage.kind === "synthesizing" ||
    stage.kind === "reveal"
      ? stage.session.currentPhase
      : Phase.UNSPECIFIED;

  const gradient =
    PHASE_GRADIENTS[currentPhase] ??
    "from-slate-900 via-slate-800 to-slate-950";

  const completedPhases = (): Set<Phase> => {
    if (
      stage.kind !== "question" &&
      stage.kind !== "synthesizing" &&
      stage.kind !== "reveal"
    ) {
      return new Set();
    }
    return new Set<Phase>(stage.session.answers.map((a) => a.phase));
  };

  const handleAnswer = (result: AnswerQuestionResult) => {
    if (result.shouldSynthesize) {
      runSynthesis(result.session);
      return;
    }
    if (result.nextQuestion) {
      setStage({
        kind: "question",
        question: result.nextQuestion,
        session: result.session,
      });
    } else {
      runSynthesis(result.session);
    }
  };

  const handleError = (message: string, code?: string) => {
    if (code === "QUOTA_EXCEEDED") {
      setStage({ kind: "paywall" });
    } else if (code === "STALE_SESSION") {
      // Another tab / retried action raced us. Refresh from server.
      router.refresh();
    } else {
      setStage({ kind: "error", message });
    }
  };

  return (
    <motion.div
      className={`min-h-screen w-full bg-gradient-to-br ${gradient} transition-all duration-1000`}
    >
      <div className="min-h-screen flex flex-col">
        {stage.kind === "question" && (
          <div className="flex items-center justify-between px-6 pt-6 pb-2 gap-3">
            <ProgressDots
              currentPhase={stage.session.currentPhase}
              completedPhases={completedPhases()}
            />
            <div className="flex items-center gap-3">
              <span className="text-white/30 text-xs">
                {t("pages.discovery.header.answersCount", {
                  count: stage.session.answers.length,
                })}
              </span>
              <button
                type="button"
                onClick={() => setRestartOpen(true)}
                disabled={isRestarting}
                className="text-white/30 hover:text-white/70 text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                title={t("pages.discovery.header.restartTooltip")}
              >
                <RotateCcw className="w-3 h-3" />
                {t("pages.discovery.header.restart")}
              </button>
            </div>
          </div>
        )}

        {showResumedHint && stage.kind === "question" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur"
          >
            {t("pages.discovery.resumeHint", { count: resumedFrom })}
          </motion.div>
        )}

        <div className="flex-1 flex items-center justify-center p-6">
          <AnimatePresence mode="wait">
            {stage.kind === "question" && (
              <motion.div
                key={stage.question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full max-w-2xl"
              >
                <QuestionCard
                  question={stage.question}
                  sessionId={stage.session.id}
                  onAnswer={handleAnswer}
                  onError={handleError}
                />
              </motion.div>
            )}
            {stage.kind === "synthesizing" && (
              <motion.div
                key="synth"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SynthesisLoader answers={stage.session.answers} />
              </motion.div>
            )}
            {stage.kind === "reveal" && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-2xl"
              >
                <RevealScreen
                  candidates={stage.session.candidates}
                  sessionId={stage.session.id}
                  onSelected={() => setStage({ kind: "done" })}
                  onError={handleError}
                />
              </motion.div>
            )}
            {stage.kind === "done" && (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ShadowSaved />
              </motion.div>
            )}
            {stage.kind === "paywall" && (
              <motion.div key="paywall" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <PaywallGate />
              </motion.div>
            )}
            {stage.kind === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white/60 max-w-sm"
              >
                <p className="text-lg mb-2">{t("pages.discovery.error.title")}</p>
                <p className="text-sm">{stage.message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <RestartConfirmDialog
        open={restartOpen}
        answersCount={currentAnswersCount}
        isPending={isRestarting}
        onOpenChange={(o) => {
          if (isRestarting) return;
          setRestartOpen(o);
        }}
        onConfirm={confirmStartOver}
      />
    </motion.div>
  );
}
