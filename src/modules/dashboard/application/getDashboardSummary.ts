import { ActionStatus } from "@/modules/actions/domain/ActionStatus";
import type { ActionRepository } from "@/modules/actions/domain/ActionRepository";
import {
  SELECTABLE_DREAM_AREAS_OF_LIFE,
  type DreamAreaOfLife,
} from "@/modules/dreams/domain/DreamAreaOfLife";
import { DreamStatus } from "@/modules/dreams/domain/DreamStatus";
import type { DreamRepository } from "@/modules/dreams/domain/DreamRepository";

import type { SentenceRepository } from "../domain/SentenceRepository";

import { pickMotivationalSentence } from "./pickMotivationalSentence";

export interface DashboardSummary {
  motivationalSentence: string | null;
  dreams: { total: number; completed: number; progressPercent: number };
  actions: { total: number; completed: number; progressPercent: number };
  todayActions: { completed: number; total: number; progress: number };
  progressByArea: { area: DreamAreaOfLife; percentage: number }[];
}

const percent = (numerator: number, denominator: number): number =>
  denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);

/**
 * Aggregate everything the dashboard needs in a single async call. Loads from
 * the three repositories in parallel — the heaviest page in the app is one
 * round-trip per source.
 */
export const getDashboardSummary = async (ctx: {
  userId: string;
  dreams: DreamRepository;
  actions: ActionRepository;
  sentences: SentenceRepository;
}): Promise<DashboardSummary> => {
  const [dreams, actions, motivationalSentence] = await Promise.all([
    ctx.dreams.listByUser(ctx.userId),
    ctx.actions.listByUser(ctx.userId),
    pickMotivationalSentence(ctx),
  ]);

  const totalDreams = dreams.length;
  const completedDreams = dreams.filter(
    (d) => d.props.status === DreamStatus.COMPLETED,
  ).length;

  const totalActions = actions.length;
  const completedActions = actions.filter(
    (a) => a.props.status === ActionStatus.COMPLETED,
  ).length;

  const today = new Date().toISOString().split("T")[0];
  const todayActions = actions.filter((a) => a.props.dueDate === today);
  const todayCompleted = todayActions.filter(
    (a) => a.props.status === ActionStatus.COMPLETED,
  ).length;

  const progressByArea = SELECTABLE_DREAM_AREAS_OF_LIFE.map((area) => {
    const areaDreams = dreams.filter((d) => d.props.areaOfLife === area);
    const areaCompleted = areaDreams.filter(
      (d) => d.props.status === DreamStatus.COMPLETED,
    ).length;
    return { area, percentage: percent(areaCompleted, areaDreams.length) };
  });

  return {
    motivationalSentence,
    dreams: {
      total: totalDreams,
      completed: completedDreams,
      progressPercent: percent(completedDreams, totalDreams),
    },
    actions: {
      total: totalActions,
      completed: completedActions,
      progressPercent: percent(completedActions, totalActions),
    },
    todayActions: {
      completed: todayCompleted,
      total: todayActions.length,
      progress: percent(todayCompleted, todayActions.length),
    },
    progressByArea,
  };
};
