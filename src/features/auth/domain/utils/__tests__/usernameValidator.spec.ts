import { describe, expect, it } from "vitest";
import { UsernameValidator } from "../usernameValidator";
import { AuthErrorCode } from "../../errors/UserErrors";

describe("UsernameValidator - Unit Test", () => {
  describe("ensureNotEmpty", () => {
    it("should not throw an error if the username is valid and not empty", () => {
      expect(() => UsernameValidator.ensureNotEmpty("valid_user")).not.toThrow();
    });

    it("should throw a UserValidationError if the username is an empty string", () => {
      expect(() => UsernameValidator.ensureNotEmpty("")).toThrow(
        expect.objectContaining({
          message: "The username is required.",
          code: AuthErrorCode.REQUIRED_FIELD_MISSING,
        }),
      );
    });

    it("should throw a UserValidationError if the username contains only spaces", () => {
      expect(() => UsernameValidator.ensureNotEmpty("     ")).toThrow(
        expect.objectContaining({
          message: "The username is required.",
          code: AuthErrorCode.REQUIRED_FIELD_MISSING,
        }),
      );
    });
  });

  describe("ensureHasMinLength", () => {
    it("should not throw an error if the username meets the minimum length restriction", () => {
      expect(() => UsernameValidator.ensureHasMinLength("abc")).not.toThrow();
    });

    it("should throw a UserValidationError if the username is shorter than 3 characters", () => {
      expect(() => UsernameValidator.ensureHasMinLength("jo")).toThrow(
        expect.objectContaining({
          message: "Username must be at least 3 characters long.",
          code: AuthErrorCode.INVALID_USERNAME,
        }),
      );
    });
  });

  describe("ensureLessThanMaxLength", () => {
    it("should not throw an error if the username length is exactly at the upper limit", () => {
      expect(() => UsernameValidator.ensureLessThanMaxLength("a".repeat(20))).not.toThrow();
    });

    it("should throw a UserValidationError if the username exceeds 20 characters", () => {
      expect(() => UsernameValidator.ensureLessThanMaxLength("a".repeat(21))).toThrow(
        expect.objectContaining({
          message: "Username cannot be longer than 20 characters.",
          code: AuthErrorCode.INVALID_USERNAME,
        }),
      );
    });
  });

  describe("ensureValidCharacters", () => {
    it("should allow alphanumeric characters and underscores", () => {
      expect(() => UsernameValidator.ensureValidCharacters("rick_sanchez_C137")).not.toThrow();
    });

    it("should throw a UserValidationError if it contains spaces", () => {
      expect(() => UsernameValidator.ensureValidCharacters("rick sanchez")).toThrow(
        expect.objectContaining({
          message: "Username can only contain letters, numbers, and underscores.",
          code: AuthErrorCode.INVALID_USERNAME,
        }),
      );
    });

    it("should throw a UserValidationError if it contains special characters or hyphens", () => {
      const invalidUsernames = ["rick-sanchez", "morty.smith", "player1!", "test@user"];

      invalidUsernames.forEach((username) => {
        expect(() => UsernameValidator.ensureValidCharacters(username)).toThrow(
          expect.objectContaining({
            message: "Username can only contain letters, numbers, and underscores.",
            code: AuthErrorCode.INVALID_USERNAME,
          }),
        );
      });
    });
  });
});
