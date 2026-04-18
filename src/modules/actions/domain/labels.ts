import {
  Action_ActionRecurrence,
  Action_ActionStatus,
} from "@/modules/actions/proto/v1/action_pb";

/**
 * UI-facing metadata for the Action proto enums. Translation-key suffixes
 * and the subsets the UI exposes; the `.proto` stays schema-only.
 */

export const ACTION_STATUS_LABELS: Record<Action_ActionStatus, string> = {
  [Action_ActionStatus.UNSPECIFIED]: "UNSPECIFIED",
  [Action_ActionStatus.NOT_STARTED]: "NOT_STARTED",
  [Action_ActionStatus.IN_PROGRESS]: "IN_PROGRESS",
  [Action_ActionStatus.COMPLETED]: "COMPLETED",
};

export const SELECTABLE_ACTION_STATUSES: readonly Action_ActionStatus[] = [
  Action_ActionStatus.NOT_STARTED,
  Action_ActionStatus.IN_PROGRESS,
  Action_ActionStatus.COMPLETED,
] as const;

export const isActionStatus = (value: unknown): value is Action_ActionStatus =>
  typeof value === "number" && value in ACTION_STATUS_LABELS;

export const ACTION_RECURRENCE_LABELS: Record<Action_ActionRecurrence, string> =
  {
    [Action_ActionRecurrence.UNSPECIFIED]: "UNSPECIFIED",
    [Action_ActionRecurrence.ONCE]: "ONCE",
    [Action_ActionRecurrence.DAILY]: "DAILY",
    [Action_ActionRecurrence.WEEKDAYS]: "WEEKDAYS",
    [Action_ActionRecurrence.WEEKENDS]: "WEEKENDS",
    [Action_ActionRecurrence.SPECIAL_DAYS]: "SPECIAL_DAYS",
  };

export const SELECTABLE_ACTION_RECURRENCES: readonly Action_ActionRecurrence[] =
  [
    Action_ActionRecurrence.ONCE,
    Action_ActionRecurrence.DAILY,
    Action_ActionRecurrence.WEEKDAYS,
    Action_ActionRecurrence.WEEKENDS,
    Action_ActionRecurrence.SPECIAL_DAYS,
  ] as const;

export const isActionRecurrence = (
  value: unknown,
): value is Action_ActionRecurrence =>
  typeof value === "number" && value in ACTION_RECURRENCE_LABELS;
