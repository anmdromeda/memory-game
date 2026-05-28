import { describe, expect, it } from "vitest";
import { AuthErrorCode } from "../../errors/UserErrors";
import { RegistrationUserData } from "../RegistrationUserData";

describe("RegistrationUserData (Value Object) - Unit Test", () => {
  describe("Creation & Sanitization", () => {
    it("should create a valid instance and sanitize structural text fields", () => {
      const data = RegistrationUserData.create({
        firstName: "   Angel   ",
        lastName: "  Core  ",
        username: "  angel_dev   ",
        password: "securePassword123",
        email: "  AngelDev@Email.com   ",
        confirmPassword: "securePassword123",
      });

      expect(data.firstName).toBe("Angel");
      expect(data.lastName).toBe("Core");
      expect(data.username).toBe("angel_dev");
      expect(data.password).toBe("securePassword123");
      expect(data.email).toBe("angeldev@email.com");
    });

    it("should guarantee structural immutability by freezing the context instances", () => {
      const data = RegistrationUserData.create({
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        password: "securePassword123",
        email: "angeldev@email.com",
        confirmPassword: "securePassword123",
      });

      expect(Object.isFrozen(data)).toBe(true);
    });
  });

  describe("Validation Guards", () => {
    it("should throw a UserValidationError if firstName is empty or missing", () => {
      expect(() =>
        RegistrationUserData.create({
          firstName: "   ",
          lastName: "Doe",
          username: "johndoe",
          password: "securePassword123",
          email: "angeldev@email.com",
          confirmPassword: "securePassword123",
        }),
      ).toThrow(
        expect.objectContaining({
          message: "The first name is required.",
          code: AuthErrorCode.REQUIRED_FIELD_MISSING,
        }),
      );
    });

    it("should throw a UserValidationError if lastName is empty or missing", () => {
      expect(() =>
        RegistrationUserData.create({
          firstName: "John",
          lastName: "",
          username: "johndoe",
          password: "securePassword123",
          email: "angeldev@email.com",
          confirmPassword: "securePassword123",
        }),
      ).toThrow(
        expect.objectContaining({
          message: "The last name is required.",
          code: AuthErrorCode.REQUIRED_FIELD_MISSING,
        }),
      );
    });

    it("should throw a UserValidationError if email is empty or missing", () => {
      expect(() =>
        RegistrationUserData.create({
          firstName: "John",
          lastName: "Doe",
          username: "johndoe",
          password: "securePassword123",
          email: "   ",
          confirmPassword: "securePassword123",
        }),
      ).toThrow(
        expect.objectContaining({
          code: AuthErrorCode.REQUIRED_FIELD_MISSING,
        }),
      );
    });

    it("should throw a UserValidationError if email format is strictly invalid", () => {
      expect(() =>
        RegistrationUserData.create({
          firstName: "John",
          lastName: "Doe",
          username: "johndoe",
          password: "securePassword123",
          email: "invalid-email-format@",
          confirmPassword: "securePassword123",
        }),
      ).toThrow(
        expect.objectContaining({
          code: AuthErrorCode.INVALID_EMAIL,
        }),
      );
    });

    it("should throw a UserValidationError if username is empty or missing", () => {
      expect(() =>
        RegistrationUserData.create({
          firstName: "John",
          lastName: "Doe",
          username: "   ",
          password: "securePassword123",
          email: "angeldev@email.com",
          confirmPassword: "securePassword123",
        }),
      ).toThrow(
        expect.objectContaining({
          message: "The username is required.",
          code: AuthErrorCode.REQUIRED_FIELD_MISSING,
        }),
      );
    });

    it("should throw a UserValidationError if username contains invalid characters", () => {
      expect(() =>
        RegistrationUserData.create({
          firstName: "John",
          lastName: "Doe",
          username: "john doe!",
          password: "securePassword123",
          email: "angeldev@email.com",
          confirmPassword: "securePassword123",
        }),
      ).toThrow(
        expect.objectContaining({
          message: "Username can only contain letters, numbers, and underscores.",
          code: AuthErrorCode.INVALID_USERNAME,
        }),
      );
    });

    it("should throw a UserValidationError if username length is shorter than 3 characters", () => {
      expect(() =>
        RegistrationUserData.create({
          firstName: "John",
          lastName: "Doe",
          username: "jo",
          password: "securePassword123",
          email: "angeldev@email.com",
          confirmPassword: "securePassword123",
        }),
      ).toThrow(
        expect.objectContaining({
          message: "Username must be at least 3 characters long.",
          code: AuthErrorCode.INVALID_USERNAME,
        }),
      );
    });

    it("should throw a UserValidationError if password is empty or missing", () => {
      expect(() =>
        RegistrationUserData.create({
          firstName: "John",
          lastName: "Doe",
          username: "johndoe",
          password: "   ",
          confirmPassword: "",
          email: "angeldev@email.com",
        }),
      ).toThrow(
        expect.objectContaining({
          message: "The password is required.",
          code: AuthErrorCode.REQUIRED_FIELD_MISSING,
        }),
      );
    });

    it("should throw a UserValidationError if password length is shorter than 8 characters", () => {
      expect(() =>
        RegistrationUserData.create({
          firstName: "John",
          lastName: "Doe",
          username: "johndoe",
          password: "short",
          email: "angeldev@email.com",
          confirmPassword: "short",
        }),
      ).toThrow(
        expect.objectContaining({
          message: "Password must be at least 8 characters long.",
          code: AuthErrorCode.INVALID_PASSWORD,
        }),
      );
    });

    it("should throw a UserValidationError if confirmPassword does not match password", () => {
      expect(() =>
        RegistrationUserData.create({
          firstName: "John",
          lastName: "Doe",
          username: "johndoe",
          password: "securePassword123",
          email: "angeldev@email.com",
          confirmPassword: "differentPassword123",
        }),
      ).toThrow(
        expect.objectContaining({
          message: "Passwords do not match",
          code: AuthErrorCode.PASSWORDS_DOES_NOT_MATCH,
        }),
      );
    });
  });
});
