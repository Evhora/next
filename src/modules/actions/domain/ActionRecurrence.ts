/**
 * How often an Action repeats. Stored inside the JSONB `data` blob using the
 * label string (not the numeric value), so the column stays human-readable in
 * Supabase Studio. The numeric enum is the contract used by the UI.
 */

export enum ActionRecurrence {
  UNSPECIFIED = 0,
  ONCE = 1,
  DAILY = 2,
  WEEKDAYS = 3,
  WEEKENDS = 4,
  SPECIAL_DAYS = 5,
}

export const ACTION_RECURRENCE_LABELS: Record<ActionRecurrence, string> = {
  [ActionRecurrence.UNSPECIFIED]: "UNSPECIFIED",
  [ActionRecurrence.ONCE]: "ONCE",
  [ActionRecurrence.DAILY]: "DAILY",
  [ActionRecurrence.WEEKDAYS]: "WEEKDAYS",
  [ActionRecurrence.WEEKENDS]: "WEEKENDS",
  [ActionRecurrence.SPECIAL_DAYS]: "SPECIAL_DAYS",
};

export const SELECTABLE_ACTION_RECURRENCES: readonly ActionRecurrence[] = [
  ActionRecurrence.ONCE,
  ActionRecurrence.DAILY,
  ActionRecurrence.WEEKDAYS,
  ActionRecurrence.WEEKENDS,
  ActionRecurrence.SPECIAL_DAYS,
] as const;

export const isActionRecurrence = (
  value: unknown,
): value is ActionRecurrence =>
  typeof value === "number" && value in ACTION_RECURRENCE_LABELS;
