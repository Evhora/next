/**
 * Lifecycle states for an Action. Stored as SMALLINT in the `status` column.
 *
 * Numeric values are part of the database contract — never reorder or reuse a
 * slot. Add new values at the end.
 */

export enum ActionStatus {
  UNSPECIFIED = 0,
  NOT_STARTED = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
}

export const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  [ActionStatus.UNSPECIFIED]: "UNSPECIFIED",
  [ActionStatus.NOT_STARTED]: "NOT_STARTED",
  [ActionStatus.IN_PROGRESS]: "IN_PROGRESS",
  [ActionStatus.COMPLETED]: "COMPLETED",
};

export const SELECTABLE_ACTION_STATUSES: readonly ActionStatus[] = [
  ActionStatus.NOT_STARTED,
  ActionStatus.IN_PROGRESS,
  ActionStatus.COMPLETED,
] as const;

export const isActionStatus = (value: unknown): value is ActionStatus =>
  typeof value === "number" && value in ACTION_STATUS_LABELS;
