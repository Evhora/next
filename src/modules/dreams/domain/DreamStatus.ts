/**
 * Lifecycle states a Dream moves through. Stored as a SMALLINT in the `status`
 * column for cheap filtering, and as the same number inside the `data` blob.
 *
 * Numeric values are part of the database contract — never reorder or reuse
 * a slot. To deprecate a value, leave the slot and add a new one at the end.
 */

export enum DreamStatus {
  UNSPECIFIED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  PAUSED = 3,
}

/** Translation key suffix for each status. UI joins with `pages.dreams.status.<key>`. */
export const DREAM_STATUS_LABELS: Record<DreamStatus, string> = {
  [DreamStatus.UNSPECIFIED]: "UNSPECIFIED",
  [DreamStatus.IN_PROGRESS]: "IN_PROGRESS",
  [DreamStatus.COMPLETED]: "COMPLETED",
  [DreamStatus.PAUSED]: "PAUSED",
};

/** Statuses a user can pick from in the UI. UNSPECIFIED is internal-only. */
export const SELECTABLE_DREAM_STATUSES: readonly DreamStatus[] = [
  DreamStatus.IN_PROGRESS,
  DreamStatus.PAUSED,
  DreamStatus.COMPLETED,
] as const;

export const isDreamStatus = (value: unknown): value is DreamStatus =>
  typeof value === "number" && value in DREAM_STATUS_LABELS;
