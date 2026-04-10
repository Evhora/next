/**
 * Discriminated-union result type used by server actions to return success
 * or error to client components without throwing across the network boundary.
 *
 * Use cases still throw AppError subclasses; the action wrapper catches and
 * converts. Keeps domain code clean while making client error handling typed.
 */

import { AppError } from "./errors";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });

export const fail = (code: string, message: string): ActionResult<never> => ({
  ok: false,
  code,
  message,
});

export const failFromError = (error: unknown): ActionResult<never> => {
  if (error instanceof AppError) {
    return { ok: false, code: error.code, message: error.message };
  }
  if (error instanceof Error) {
    return { ok: false, code: "UNKNOWN", message: error.message };
  }
  return { ok: false, code: "UNKNOWN", message: "Unexpected error." };
};
