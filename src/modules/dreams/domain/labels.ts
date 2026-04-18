import {
  Dream_DreamAreaOfLife,
  Dream_DreamStatus,
} from "@/modules/dreams/proto/v1/dream_pb";

/**
 * UI-facing metadata for the proto enums. The generated `*_pb.ts` files give
 * us the enum values; translation keys and selectable subsets live here so
 * `.proto` stays schema-only.
 *
 * Translation keys: UI joins with `pages.dreams.status.<key>` and
 * `enums.dream.areaOfLife.<key>`.
 */

export const DREAM_STATUS_LABELS: Record<Dream_DreamStatus, string> = {
  [Dream_DreamStatus.UNSPECIFIED]: "UNSPECIFIED",
  [Dream_DreamStatus.IN_PROGRESS]: "IN_PROGRESS",
  [Dream_DreamStatus.COMPLETED]: "COMPLETED",
  [Dream_DreamStatus.PAUSED]: "PAUSED",
};

export const SELECTABLE_DREAM_STATUSES: readonly Dream_DreamStatus[] = [
  Dream_DreamStatus.IN_PROGRESS,
  Dream_DreamStatus.PAUSED,
  Dream_DreamStatus.COMPLETED,
] as const;

export const isDreamStatus = (value: unknown): value is Dream_DreamStatus =>
  typeof value === "number" && value in DREAM_STATUS_LABELS;

export const DREAM_AREA_OF_LIFE_LABELS: Record<Dream_DreamAreaOfLife, string> =
  {
    [Dream_DreamAreaOfLife.UNSPECIFIED]: "UNSPECIFIED",
    [Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP]:
      "FAMILY_AND_RELANTIONSHIP",
    [Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING]: "HEALTH_AND_WELL_BEING",
    [Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE]: "BUSINESS_AND_FINANCE",
    [Dream_DreamAreaOfLife.SPIRITUALITY]: "SPIRITUALITY",
    [Dream_DreamAreaOfLife.LIFESTYLE]: "LIFESTYLE",
  };

export const SELECTABLE_DREAM_AREAS_OF_LIFE: readonly Dream_DreamAreaOfLife[] =
  [
    Dream_DreamAreaOfLife.FAMILY_AND_RELANTIONSHIP,
    Dream_DreamAreaOfLife.HEALTH_AND_WELL_BEING,
    Dream_DreamAreaOfLife.BUSINESS_AND_FINANCE,
    Dream_DreamAreaOfLife.SPIRITUALITY,
    Dream_DreamAreaOfLife.LIFESTYLE,
  ] as const;

export const isDreamAreaOfLife = (
  value: unknown,
): value is Dream_DreamAreaOfLife =>
  typeof value === "number" && value in DREAM_AREA_OF_LIFE_LABELS;
