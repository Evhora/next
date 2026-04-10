import { NotFoundError } from "@/shared/errors";

export class DreamNotFoundError extends NotFoundError {
  constructor() {
    super("Dream");
  }
}
