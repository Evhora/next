import { z } from "zod";

export const PASSWORD_REQUIREMENTS_MESSAGE =
  "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial";

export function isValidPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^\p{L}\p{N}\s]/u.test(password)
  );
}

export const PasswordSchema = z
  .string()
  .refine(isValidPassword, PASSWORD_REQUIREMENTS_MESSAGE);

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().optional().default(""),
});

export const UpdatePasswordSchema = z.object({
  newPassword: PasswordSchema,
  confirmPassword: z.string(),
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
