import { describe, expect, it } from "vitest";

import {
  getPasswordValidationErrors,
  isValidPassword,
  PasswordValidationError,
} from "./schemas";

describe("password validation", () => {
  it("accepts a valid password", () => {
    expect(isValidPassword("Valid123!")).toBe(true);
    expect(getPasswordValidationErrors("Valid123!")).toEqual([]);
  });

  it("rejects a password missing a numeric character", () => {
    expect(isValidPassword("ValidPass!")).toBe(false);
    expect(getPasswordValidationErrors("ValidPass!")).toContain(
      PasswordValidationError.MissingNumber,
    );
  });

  it("rejects a password missing a lowercase letter", () => {
    expect(isValidPassword("VALID123!")).toBe(false);
    expect(getPasswordValidationErrors("VALID123!")).toContain(
      PasswordValidationError.MissingLowercase,
    );
  });

  it("rejects a password missing an uppercase letter", () => {
    expect(isValidPassword("valid123!")).toBe(false);
    expect(getPasswordValidationErrors("valid123!")).toContain(
      PasswordValidationError.MissingUppercase,
    );
  });

  it("rejects a password missing a special character", () => {
    expect(isValidPassword("Valid1234")).toBe(false);
    expect(getPasswordValidationErrors("Valid1234")).toContain(
      PasswordValidationError.MissingSpecialCharacter,
    );
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(isValidPassword("Va1!abc")).toBe(false);
    expect(getPasswordValidationErrors("Va1!abc")).toContain(
      PasswordValidationError.MinLength,
    );
  });

  it("returns multiple validation failures", () => {
    expect(isValidPassword("abcdefg")).toBe(false);
    expect(getPasswordValidationErrors("abcdefg")).toEqual(
      expect.arrayContaining([
        PasswordValidationError.MinLength,
        PasswordValidationError.MissingUppercase,
        PasswordValidationError.MissingNumber,
        PasswordValidationError.MissingSpecialCharacter,
      ]),
    );
  });

  it("accepts boundary case with exactly 8 characters", () => {
    expect(isValidPassword("Aa1!bcde")).toBe(true);
  });

  it("accepts long valid passwords", () => {
    expect(isValidPassword("VeryLongPassword123!@#WithMoreChars")).toBe(true);
  });
});
