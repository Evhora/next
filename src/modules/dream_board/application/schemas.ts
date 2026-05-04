import { z } from "zod";

import { SELECTABLE_DREAM_BOARD_STYLES } from "../domain/labels";

/**
 * Command schemas for the DreamBoard use cases.
 *
 * Deliberate omission: there is NO `prompt` or free-text field anywhere. The
 * prompt is built server-side from server-owned data (dream titles + style
 * enum). This is the feature's abuse boundary — if a user could pass text,
 * they could repurpose the Nano Banana integration for anything. Users who
 * want to add a dream from this screen create a real Dream row first; its
 * title flows in the same as any other.
 */

export const generateDreamBoardSchema = z.object({
  dreamIds: z
    .array(z.string().uuid())
    .min(1, "Pick at least one dream.")
    .max(10, "Pick at most 10 dreams."),
  style: z
    .number()
    .int()
    .refine(
      (value): value is (typeof SELECTABLE_DREAM_BOARD_STYLES)[number] =>
        (SELECTABLE_DREAM_BOARD_STYLES as readonly number[]).includes(value),
      "Style is not selectable.",
    ),
});

export const regenerateDreamBoardSchema = z.object({
  id: z.string().uuid(),
});

export const deleteDreamBoardSchema = z.object({
  id: z.string().uuid(),
});

/**
 * The photo arrives as a data URL produced by client-side canvas resizing
 * (≤768px, JPEG). Server trims to 2 MB after decoding — the client-side cap
 * is 5 MB of input but the downscaled output should be well under this.
 */
export const uploadUserPhotoSchema = z.object({
  dataUrl: z
    .string()
    .regex(
      /^data:image\/(jpeg|png|webp);base64,/,
      "Unsupported image format.",
    )
    .max(8 * 1024 * 1024, "Image is too large."),
});

export type GenerateDreamBoardCmd = z.infer<typeof generateDreamBoardSchema>;
export type RegenerateDreamBoardCmd = z.infer<
  typeof regenerateDreamBoardSchema
>;
export type DeleteDreamBoardCmd = z.infer<typeof deleteDreamBoardSchema>;
export type UploadUserPhotoCmd = z.infer<typeof uploadUserPhotoSchema>;
