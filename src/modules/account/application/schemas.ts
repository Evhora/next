import { z } from "zod";

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().optional().default(""),
});

export const UpdatePasswordSchema = z.object({
  newPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const UploadAvatarSchema = z.object({
  avatarUrl: z.string().url(),
});

export type UpdateProfileCmd = z.infer<typeof UpdateProfileSchema>;
export type UpdatePasswordCmd = z.infer<typeof UpdatePasswordSchema>;
export type UploadAvatarCmd = z.infer<typeof UploadAvatarSchema>;
