"use client";

import { Phase } from "../proto/v1/session_pb";

const PHASES = [
  Phase.CHILDHOOD,
  Phase.ENVY,
  Phase.ENERGY,
  Phase.MONEY,
  Phase.PAIN,
  Phase.DEATH,
];

const PHASE_COLORS: Record<number, string> = {
  [Phase.CHILDHOOD]: "bg-amber-400",
  [Phase.ENVY]: "bg-emerald-400",
  [Phase.ENERGY]: "bg-orange-400",
  [Phase.MONEY]: "bg-yellow-400",
  [Phase.PAIN]: "bg-rose-400",
  [Phase.DEATH]: "bg-purple-400",
};

interface ProgressDotsProps {
  currentPhase: Phase;
  completedPhases: Set<Phase>;
}

export function ProgressDots({ currentPhase, completedPhases }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {PHASES.map((phase) => {
        const isCompleted = completedPhases.has(phase);
        const isCurrent = phase === currentPhase;
        const colorClass = PHASE_COLORS[phase] ?? "bg-gray-400";

        return (
          <div
            key={phase}
            className={[
              "rounded-full transition-all duration-500",
              isCurrent ? "w-3 h-3" : "w-2 h-2",
              isCompleted || isCurrent ? colorClass : "bg-white/20",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
