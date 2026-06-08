import { z } from "zod";

export const PASSWORD_REQUIREMENTS_MESSAGE =
  "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial";

export const MIN_PASSWORD_LENGTH = 8;

export enum PasswordValidationError {
  MinLength = "passwordMinLengthError",
  MissingUppercase = "passwordMissingUppercaseError",
  MissingLowercase = "passwordMissingLowercaseError",
  MissingNumber = "passwordMissingNumberError",
  MissingSpecialCharacter = "passwordMissingSpecialCharacterError",
}

export function isValidPassword(password: string): boolean {
  return getPasswordValidationErrors(password).length === 0;
}

export function getPasswordValidationErrors(
  password: string,
): PasswordValidationError[] {
  const errors: PasswordValidationError[] = [];

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(PasswordValidationError.MinLength);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push(PasswordValidationError.MissingUppercase);
  }
  if (!/[a-z]/.test(password)) {
    errors.push(PasswordValidationError.MissingLowercase);
  }
  if (!/\d/.test(password)) {
    errors.push(PasswordValidationError.MissingNumber);
  }
  if (!/[^\p{L}\p{N}\s]/u.test(password)) {
    errors.push(PasswordValidationError.MissingSpecialCharacter);
  }

  return errors;
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
