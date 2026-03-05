export enum ActionStatus {
  UNSPECIFIED = 0,
  NOT_STARTED = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
}

export const ActionStatusNames = {
  [ActionStatus.UNSPECIFIED]: "UNSPECIFIED",
  [ActionStatus.NOT_STARTED]: "NOT_STARTED",
  [ActionStatus.IN_PROGRESS]: "IN_PROGRESS",
  [ActionStatus.COMPLETED]: "COMPLETED",
};

export enum ActionRecurrence {
  UNSPECIFIED = 0,
  ONCE = 1,
  DAILY = 2,
  WEEKDAYS = 3,
  WEEKENDS = 4,
  SPECIAL_DAYS = 5,
}

export const ActionRecurrenceNames = {
  [ActionRecurrence.UNSPECIFIED]: "UNSPECIFIED",
  [ActionRecurrence.ONCE]: "ONCE",
  [ActionRecurrence.DAILY]: "DAILY",
  [ActionRecurrence.WEEKDAYS]: "WEEKDAYS",
  [ActionRecurrence.WEEKENDS]: "WEEKENDS",
  [ActionRecurrence.SPECIAL_DAYS]: "SPECIAL_DAYS",
};
