import { AppError, NotFoundError } from "@/shared/errors";

export class DreamBoardNotFoundError extends NotFoundError {
  constructor() {
    super("DreamBoard");
  }
}

export class ConversationNotFoundError extends NotFoundError {
  constructor() {
    super("Conversation");
  }
}

export class UserPhotoRequiredError extends AppError {
  constructor() {
    super(
      "USER_PHOTO_REQUIRED",
      "Upload a reference photo before generating a dream board.",
    );
  }
}

export class DailyQuotaExceededError extends AppError {
  constructor(limit: number) {
    super(
      "QUOTA_EXCEEDED",
      `Daily dream board limit of ${limit} reached. Try again tomorrow.`,
    );
  }
}
