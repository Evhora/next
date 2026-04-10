import { z } from "zod";

import { SELECTABLE_DREAM_AREAS_OF_LIFE } from "../domain/DreamAreaOfLife";
import { SELECTABLE_DREAM_STATUSES } from "../domain/DreamStatus";

/**
 * Input schemas for the Dreams use cases. The application layer never trusts
 * its caller (UI form, action, test) — every entry point parses through one of
 * these. Types are inferred from the schemas so a field can never go out of
 * sync with its validation.
 */

export const createDreamSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  areaOfLife: z
    .number()
    .int()
    .refine(
      (value): value is (typeof SELECTABLE_DREAM_AREAS_OF_LIFE)[number] =>
        (SELECTABLE_DREAM_AREAS_OF_LIFE as readonly number[]).includes(value),
      "Area of life is not selectable.",
    ),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must be an ISO date (YYYY-MM-DD)."),
  actionPlan: z.string().trim().min(1, "Action plan is required.").max(5000),
});

export const updateDreamStatusSchema = z.object({
  id: z.string().uuid(),
  status: z
    .number()
    .int()
    .refine(
      (value): value is (typeof SELECTABLE_DREAM_STATUSES)[number] =>
        (SELECTABLE_DREAM_STATUSES as readonly number[]).includes(value),
      "Status is not selectable.",
    ),
});

export const deleteDreamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateDreamInput = z.infer<typeof createDreamSchema>;
export type UpdateDreamStatusInput = z.infer<typeof updateDreamStatusSchema>;
export type DeleteDreamInput = z.infer<typeof deleteDreamSchema>;
