import { ActionStatus } from "@/modules/actions/domain/ActionStatus";
import type { ActionRepository } from "@/modules/actions/domain/ActionRepository";

import type { DreamRepository } from "../domain/DreamRepository";

export interface DreamProgress {
  total: number;
  completed: number;
}

/**
 * Compute the (completed / total) action counts for every dream owned by the
 * current user. Lives in the Dreams module because the result is consumed by
 * the dreams page; depends on ActionRepository because actions are the source
 * of progress data.
 *
 * One round-trip per repository — no N+1. The dreams list is fetched only to
 * seed the progress map with zeros so dreams without actions still show "0/0".
 */
export const getDreamProgress = async (ctx: {
  userId: string;
  dreams: DreamRepository;
  actions: ActionRepository;
}): Promise<Record<string, DreamProgress>> => {
  const [dreams, actions] = await Promise.all([
    ctx.dreams.listByUser(ctx.userId),
    ctx.actions.listByUser(ctx.userId),
  ]);

  const progress: Record<string, DreamProgress> = {};
  for (const dream of dreams) {
    progress[dream.props.id] = { total: 0, completed: 0 };
  }
  for (const action of actions) {
    const dreamId = action.props.dreamId;
    if (!dreamId || !(dreamId in progress)) continue;
    progress[dreamId].total += 1;
    if (action.props.status === ActionStatus.COMPLETED) {
      progress[dreamId].completed += 1;
    }
  }
  return progress;
};
