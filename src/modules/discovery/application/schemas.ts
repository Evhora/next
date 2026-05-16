import { z } from "zod";

export const startSessionSchema = z.object({});
export type StartSessionCmd = z.infer<typeof startSessionSchema>;

export const answerQuestionSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().min(1),
  text: z.string().max(5000).optional(),
  skipped: z.boolean().optional().default(false),
});
export type AnswerQuestionCmd = z.infer<typeof answerQuestionSchema>;

export const synthesizeCandidatesSchema = z.object({
  sessionId: z.string().uuid(),
});
export type SynthesizeCandidatesCmd = z.infer<typeof synthesizeCandidatesSchema>;

export const transcribeVoiceSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().min(1),
});
export type TranscribeVoiceCmd = z.infer<typeof transcribeVoiceSchema>;
