import { RuleBasedValidator, type ValidationRules } from "../../../../shared/domain/utils/ruleBasedValidator";
import { AuthErrorCode, UserValidationError } from "../errors/UserErrors";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailValidator {
  static rules: ValidationRules<{ email: string }> = {
    email: [this.ensureNotEmpty, this.ensureIsValidFormat],
  };

  static ensureNotEmpty(email: string) {
    if (!email || email.trim() === "") {
      throw new UserValidationError({
        code: AuthErrorCode.REQUIRED_FIELD_MISSING,
        message: "The email is required.",
      });
    }
  }

  static ensureIsValidFormat(email: string) {
    if (!EMAIL_REGEX.test(email)) {
      throw new UserValidationError({ code: AuthErrorCode.INVALID_EMAIL, message: "The email format is invalid." });
    }
  }

  static validate(email: string) {
    return RuleBasedValidator.validate({ email }, this.rules);
  }
}
