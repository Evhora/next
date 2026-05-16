import { describe, expect, it } from "vitest";

import {
  AppError,
  IntegrationError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./errors";

describe("AppError", () => {
  it("sets code and message", () => {
    const err = new AppError("MY_CODE", "my message");
    expect(err.code).toBe("MY_CODE");
    expect(err.message).toBe("my message");
    expect(err).toBeInstanceOf(Error);
  });

  it("sets name to constructor name", () => {
    const err = new AppError("X", "y");
    expect(err.name).toBe("AppError");
  });
});

describe("UnauthorizedError", () => {
  it("uses UNAUTHORIZED code and default message", () => {
    const err = new UnauthorizedError();
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("You must be signed in.");
    expect(err).toBeInstanceOf(AppError);
  });

  it("accepts custom message", () => {
    const err = new UnauthorizedError("custom");
    expect(err.message).toBe("custom");
  });
});

describe("NotFoundError", () => {
  it("uses NOT_FOUND code with resource name", () => {
    const err = new NotFoundError("Dream");
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Dream not found.");
    expect(err).toBeInstanceOf(AppError);
  });
});

describe("ValidationError", () => {
  it("uses VALIDATION code", () => {
    const err = new ValidationError("bad input");
    expect(err.code).toBe("VALIDATION");
    expect(err.message).toBe("bad input");
  });
});

describe("IntegrationError", () => {
  it("uses INTEGRATION code", () => {
    const err = new IntegrationError("stripe failed");
    expect(err.code).toBe("INTEGRATION");
    expect(err.message).toBe("stripe failed");
  });
});
