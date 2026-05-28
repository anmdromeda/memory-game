import { describe, expect, it } from "vitest";
import { AuthErrorCode, UserValidationError } from "../../errors/UserErrors";
import { PasswordValidator } from "../passwordValidator";

const MIN_PASSWORD_LENGTH = 8;

describe("PasswordValidator - Unit Test", () => {
  describe("ensureNotEmpty", () => {
    it("should pass silently when the password contains text characters", () => {
      expect(() => PasswordValidator.ensureNotEmpty("validPassword123")).not.toThrow();
    });

    it("should throw a UserValidationError with REQUIRED_FIELD_MISSING code if password is only white spaces", () => {
      expect(() => PasswordValidator.ensureNotEmpty("      ")).toThrow(
        expect.objectContaining({
          code: AuthErrorCode.REQUIRED_FIELD_MISSING,
          message: "The password is required.",
        }),
      );
    });

    it("should throw if the evaluated argument is an empty string literal", () => {
      expect(() => PasswordValidator.ensureNotEmpty("")).toThrow(UserValidationError);
    });
  });

  describe("ensureHasMinLength", () => {
    it(`should pass silently when the password length is exactly ${MIN_PASSWORD_LENGTH} characters`, () => {
      const exactBoundaryPassword = "a".repeat(MIN_PASSWORD_LENGTH);
      expect(() => PasswordValidator.ensureHasMinLength(exactBoundaryPassword)).not.toThrow();
    });

    it(`should pass silently when the password length is strictly greater than ${MIN_PASSWORD_LENGTH} characters`, () => {
      const longPassword = "a".repeat(MIN_PASSWORD_LENGTH + 5);
      expect(() => PasswordValidator.ensureHasMinLength(longPassword)).not.toThrow();
    });

    it(`should throw a UserValidationError with INVALID_PASSWORD code when the length is shorter than ${MIN_PASSWORD_LENGTH} characters`, () => {
      const shortPassword = "a".repeat(MIN_PASSWORD_LENGTH - 1);

      expect(() => PasswordValidator.ensureHasMinLength(shortPassword)).toThrow(
        expect.objectContaining({
          code: AuthErrorCode.INVALID_PASSWORD,
          message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        }),
      );
    });
  });
});
