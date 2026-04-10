/**
 * Application-wide error hierarchy. Use cases throw these; the server-action
 * boundary catches them and converts them to user-facing toast messages.
 *
 * Domain-specific errors (e.g. DreamNotFound) extend AppError so the boundary
 * doesn't need to know about every subtype.
 */

export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You must be signed in.") {
    super("UNAUTHORIZED", message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super("NOT_FOUND", `${resource} not found.`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super("VALIDATION", message);
  }
}

export class IntegrationError extends AppError {
  constructor(message: string) {
    super("INTEGRATION", message);
  }
}
