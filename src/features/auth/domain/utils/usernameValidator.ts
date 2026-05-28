import { AuthErrorCode, UserValidationError } from "../errors/UserErrors";
import { type ValidationRules } from "../../../../shared/domain/utils/ruleBasedValidator";

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 20;

export class UsernameValidator {
  static rules: ValidationRules<{ username: string }> = {
    username: [this.ensureNotEmpty, this.ensureValidCharacters, this.ensureHasMinLength, this.ensureLessThanMaxLength],
  };

  static ensureNotEmpty(value: string): void {
    if (!value || value.trim() === "") {
      throw new UserValidationError({
        message: "The username is required.",
        code: AuthErrorCode.REQUIRED_FIELD_MISSING,
      });
    }
  }

  static ensureHasMinLength(value: string): void {
    if (value.length < MIN_USERNAME_LENGTH) {
      throw new UserValidationError({
        message: `Username must be at least ${MIN_USERNAME_LENGTH} characters long.`,
        code: AuthErrorCode.INVALID_USERNAME,
      });
    }
  }

  static ensureLessThanMaxLength(value: string): void {
    if (value.length > MAX_USERNAME_LENGTH) {
      throw new UserValidationError({
        message: `Username cannot be longer than ${MAX_USERNAME_LENGTH} characters.`,
        code: AuthErrorCode.INVALID_USERNAME,
      });
    }
  }

  static ensureValidCharacters(value: string): void {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(value)) {
      throw new UserValidationError({
        message: "Username can only contain letters, numbers, and underscores.",
        code: AuthErrorCode.INVALID_USERNAME,
      });
    }
  }
}
