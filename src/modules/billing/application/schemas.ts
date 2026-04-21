import { z } from "zod";

export const startCheckoutSchema = z.object({
  priceId: z.string().trim().min(1, "priceId is required."),
});
export type StartCheckoutCmd = z.infer<typeof startCheckoutSchema>;

export const changePlanSchema = z.object({
  newPriceId: z.string().trim().min(1, "newPriceId is required."),
});
export type ChangePlanCmd = z.infer<typeof changePlanSchema>;
