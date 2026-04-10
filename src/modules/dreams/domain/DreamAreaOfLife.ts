/**
 * The five life-areas a Dream is grouped under. Stored as a SMALLINT in the
 * `area_of_life` column for cheap filtering, paired with `area_of_life_name`
 * (TEXT) so humans inspecting the database see meaningful values without
 * joining a lookup table.
 *
 * Numeric values are part of the database contract — never reorder or reuse
 * a slot. To deprecate a value, leave the slot and add a new one at the end.
 */

export enum DreamAreaOfLife {
  UNSPECIFIED = 0,
  FAMILY_AND_RELANTIONSHIP = 1,
  HEALTH_AND_WELL_BEING = 2,
  BUSINESS_AND_FINANCE = 3,
  SPIRITUALITY = 4,
  LIFESTYLE = 5,
}

/** Translation key suffix for each area. UI joins with `enums.dream.areaOfLife.<key>`. */
export const DREAM_AREA_OF_LIFE_LABELS: Record<DreamAreaOfLife, string> = {
  [DreamAreaOfLife.UNSPECIFIED]: "UNSPECIFIED",
  [DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]: "FAMILY_AND_RELANTIONSHIP",
  [DreamAreaOfLife.HEALTH_AND_WELL_BEING]: "HEALTH_AND_WELL_BEING",
  [DreamAreaOfLife.BUSINESS_AND_FINANCE]: "BUSINESS_AND_FINANCE",
  [DreamAreaOfLife.SPIRITUALITY]: "SPIRITUALITY",
  [DreamAreaOfLife.LIFESTYLE]: "LIFESTYLE",
};

/** Areas a user can pick from in the UI. UNSPECIFIED is internal-only. */
export const SELECTABLE_DREAM_AREAS_OF_LIFE: readonly DreamAreaOfLife[] = [
  DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP,
  DreamAreaOfLife.HEALTH_AND_WELL_BEING,
  DreamAreaOfLife.BUSINESS_AND_FINANCE,
  DreamAreaOfLife.SPIRITUALITY,
  DreamAreaOfLife.LIFESTYLE,
] as const;

export const isDreamAreaOfLife = (value: unknown): value is DreamAreaOfLife =>
  typeof value === "number" && value in DREAM_AREA_OF_LIFE_LABELS;
