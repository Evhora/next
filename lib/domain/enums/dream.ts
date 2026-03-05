export enum DreamStatus {
  UNSPECIFIED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  PAUSED = 3,
}

export const DreamStatusNames = {
  [DreamStatus.UNSPECIFIED]: "UNSPECIFIED",
  [DreamStatus.IN_PROGRESS]: "IN_PROGRESS",
  [DreamStatus.COMPLETED]: "COMPLETED",
  [DreamStatus.PAUSED]: "PAUSED",
};

export enum DreamAreaOfLife {
  UNSPECIFIED = 0,
  FAMILY_AND_RELANTIONSHIP = 1,
  HEALTH_AND_WELL_BEING = 2,
  BUSINESS_AND_FINANCE = 3,
  SPIRITUALITY = 4,
  LIFESTYLE = 5,
}

export const DreamAreaOfLifeNames = {
  [DreamAreaOfLife.UNSPECIFIED]: "UNSPECIFIED",
  [DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: "FAMILY_AND_RELANTIONSHIP",
  [DreamAreaOfLife.HEALTH_AND_WELL_BEING]: "HEALTH_AND_WELL_BEING",
  [DreamAreaOfLife.BUSINESS_AND_FINANCE]: "BUSINESS_AND_FINANCE",
  [DreamAreaOfLife.SPIRITUALITY]: "SPIRITUALITY",
  [DreamAreaOfLife.LIFESTYLE]: "LIFESTYLE",
};

/** Map from enum label (string) to enum value (number) for area_of_life column and parsing. */
export const DreamAreaOfLifeByLabel: Record<string, DreamAreaOfLife> =
  Object.fromEntries(
    (Object.entries(DreamAreaOfLifeNames) as [string, string][]).map(
      ([k, v]) => [v, Number(k) as DreamAreaOfLife],
    ),
  ) as Record<string, DreamAreaOfLife>;
