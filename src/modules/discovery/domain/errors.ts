import { AppError, NotFoundError } from "@/shared/errors";

export class SessionNotFoundError extends NotFoundError {
  constructor() {
    super("Session");
  }
}

export class SessionAlreadyCompletedError extends AppError {
  constructor() {
    super("SESSION_ALREADY_COMPLETED", "This session has already been completed.");
  }
}

export class SynthesisFailedError extends AppError {
  constructor(reason?: string) {
    super("SYNTHESIS_FAILED", reason ?? "Failed to synthesize dream candidates.");
  }
}

export class QuotaExceededError extends AppError {
  constructor() {
    super("QUOTA_EXCEEDED", "Upgrade to continue the quiz.");
  }
}
