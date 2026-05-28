import { describe, expect, it } from "vitest";
import { AuthErrorCode, UserValidationError } from "../../errors/UserErrors";
import { AppError } from "../../../../../shared/domain/errors/AppErrors";
import { EmailValidator } from "../emailValidator";

describe("EmailValidator & UserValidationError - Unit Test", () => {
  describe("UserValidationError", () => {
    it("should correctly instantiate with code and message parameters aligned to the base contract", () => {
      const error = new UserValidationError({
        code: AuthErrorCode.INVALID_EMAIL,
        message: "Custom validation message.",
      });

      expect(error).toBeInstanceOf(UserValidationError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(AuthErrorCode.INVALID_EMAIL);
      expect(error.message).toBe("Custom validation message.");
    });
  });

  describe("EmailValidator.ensureNotEmpty", () => {
    it("should pass silently without throwing errors when email is not empty", () => {
      expect(() => EmailValidator.ensureNotEmpty("test@example.com")).not.toThrow();
    });

    it("should throw an UserValidationError with REQUIRED_FIELD_MISSING code if email is empty", () => {
      expect(() => EmailValidator.ensureNotEmpty("   ")).toThrow(
        expect.objectContaining({
          code: AuthErrorCode.REQUIRED_FIELD_MISSING,
          message: "The email is required.",
        }),
      );
    });

    it("should throw if the argument evaluated is an empty string literal", () => {
      expect(() => EmailValidator.ensureNotEmpty("")).toThrow(UserValidationError);
    });
  });

  describe("EmailValidator.ensureIsValidFormat", () => {
    it("should process syntactically valid email strings without side effects", () => {
      const validEmails = ["user@domain.com", "firstname.lastname@domain.co.uk", "user+labels@subdomain.domain.org"];

      validEmails.forEach((email) => {
        expect(() => EmailValidator.ensureIsValidFormat(email)).not.toThrow();
      });
    });

    it("should throw an UserValidationError with INVALID_EMAIL code when format matching fails", () => {
      const invalidEmails = [
        "plaintext",
        "missing-domain@",
        "@missing-local.com",
        "spaces in@email.com",
        "double@@domain.com",
      ];

      invalidEmails.forEach((email) => {
        expect(() => EmailValidator.ensureIsValidFormat(email)).toThrow(
          expect.objectContaining({
            code: AuthErrorCode.INVALID_EMAIL,
            message: "The email format is invalid.",
          }),
        );
      });
    });
  });
});
