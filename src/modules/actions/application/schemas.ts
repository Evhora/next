import { z } from "zod";

import { SELECTABLE_DREAM_AREAS_OF_LIFE } from "@/modules/dreams/domain/labels";

import {
  SELECTABLE_ACTION_RECURRENCES,
  SELECTABLE_ACTION_STATUSES,
} from "../domain/labels";

const recurrenceSchema = z
  .number()
  .int()
  .refine(
    (value): value is (typeof SELECTABLE_ACTION_RECURRENCES)[number] =>
      (SELECTABLE_ACTION_RECURRENCES as readonly number[]).includes(value),
    "Recurrence is not selectable.",
  );

const statusSchema = z
  .number()
  .int()
  .refine(
    (value): value is (typeof SELECTABLE_ACTION_STATUSES)[number] =>
      (SELECTABLE_ACTION_STATUSES as readonly number[]).includes(value),
    "Status is not selectable.",
  );

export const createActionSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  dreamId: z.string().uuid().nullable(),
  dreamAreaOfLife: z
    .number()
    .int()
    .refine(
      (value): value is (typeof SELECTABLE_DREAM_AREAS_OF_LIFE)[number] =>
        (SELECTABLE_DREAM_AREAS_OF_LIFE as readonly number[]).includes(value),
      "Area of life is not selectable.",
    )
    .nullable(),
  recurrence: recurrenceSchema,
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be ISO date (YYYY-MM-DD).")
    .nullable(),
});

export const updateActionStatusSchema = z.object({
  id: z.string().uuid(),
  status: statusSchema,
});

export const deleteActionSchema = z.object({
  id: z.string().uuid(),
});

export type CreateActionCmd = z.infer<typeof createActionSchema>;
export type UpdateActionStatusCmd = z.infer<typeof updateActionStatusSchema>;
export type DeleteActionCmd = z.infer<typeof deleteActionSchema>;
