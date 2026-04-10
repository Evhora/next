import { NotFoundError } from "@/shared/errors";

export class ActionNotFoundError extends NotFoundError {
  constructor() {
    super("Action");
  }
}
