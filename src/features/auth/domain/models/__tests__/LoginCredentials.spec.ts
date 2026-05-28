import { describe, expect, it } from "vitest";
import { AuthErrorCode } from "../../errors/UserErrors";
import { LoginCredentials } from "../LoginCredentials";

describe("LoginCredentials (Value Object) - Unit Test", () => {
  describe("Creation & Sanitization", () => {
    it("should create a valid instance and normalize the username", () => {
      const credentials = LoginCredentials.create({
        username: "  ANGEL_dev  ",
        password: "securePassword123",
      });

      expect(credentials.username).toBe("angel_dev");
      expect(credentials.password).toBe("securePassword123");
    });

    it("should guarantee structural immutability by freezing the instance properties", () => {
      const credentials = LoginCredentials.create({
        username: "johndoe",
        password: "password",
      });

      expect(Object.isFrozen(credentials)).toBe(true);
    });
  });

  describe("Validation Guards", () => {
    it("should throw a UserValidationError if username is empty or missing", () => {
      expect(() =>
        LoginCredentials.create({
          username: "   ",
          password: "password123",
        }),
      ).toThrow(
        expect.objectContaining({
          message: "The username is required.",
          code: AuthErrorCode.REQUIRED_FIELD_MISSING,
        }),
      );
    });

    it("should throw a UserValidationError if password is empty or missing", () => {
      expect(() =>
        LoginCredentials.create({
          username: "angel_dev",
          password: "   ",
        }),
      ).toThrow(
        expect.objectContaining({
          message: "The password is required.",
          code: AuthErrorCode.REQUIRED_FIELD_MISSING,
        }),
      );
    });
  });
});
