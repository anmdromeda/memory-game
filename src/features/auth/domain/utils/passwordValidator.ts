import { RuleBasedValidator, type ValidationRules } from "../../../../shared/domain/utils/ruleBasedValidator";
import { AuthErrorCode, UserValidationError } from "../errors/UserErrors";

const MIN_PASSWORD_LENGTH = 8;

export class PasswordValidator {
  static rules: ValidationRules<{ confirmPassword: string; password: string }> = {
    password: [PasswordValidator.ensureNotEmpty, PasswordValidator.ensureHasMinLength],
    confirmPassword: [
      PasswordValidator.ensureNotEmpty,
      PasswordValidator.ensureHasMinLength,
      (value: string, props) => {
        if (props.password !== value) {
          throw new UserValidationError({
            message: "Passwords do not match",
            code: AuthErrorCode.PASSWORDS_DOES_NOT_MATCH,
          });
        }
      },
    ],
  };

  static ensureNotEmpty(value: string) {
    if (!value || value.trim() === "") {
      throw new UserValidationError({ message: "The password is required.", code: AuthErrorCode.REQUIRED_FIELD_MISSING });
    }
  }

  static ensureHasMinLength(value: string) {
    if (value.length < MIN_PASSWORD_LENGTH) {
      throw new UserValidationError({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        code: AuthErrorCode.INVALID_PASSWORD,
      });
    }
  }

  static validate(passwords: { confirmPassword: string; password: string }) {
    return RuleBasedValidator.validate(passwords, this.rules);
  }
}
