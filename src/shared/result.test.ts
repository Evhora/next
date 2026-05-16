import { describe, expect, it } from "vitest";

import { AppError } from "./errors";
import { fail, failFromError, ok } from "./result";

describe("ok", () => {
  it("returns ok result with data", () => {
    const result = ok({ id: "1" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ id: "1" });
  });
});

describe("fail", () => {
  it("returns error result with code and message", () => {
    const result = fail("NOT_FOUND", "Dream not found.");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("NOT_FOUND");
      expect(result.message).toBe("Dream not found.");
    }
  });
});

describe("failFromError", () => {
  it("converts AppError to result", () => {
    const err = new AppError("MY_CODE", "my message");
    const result = failFromError(err);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("MY_CODE");
      expect(result.message).toBe("my message");
    }
  });

  it("converts generic Error to UNKNOWN", () => {
    const result = failFromError(new Error("boom"));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("UNKNOWN");
      expect(result.message).toBe("boom");
    }
  });

  it("handles non-Error thrown value", () => {
    const result = failFromError("a string");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("UNKNOWN");
      expect(result.message).toBe("Unexpected error.");
    }
  });
});
