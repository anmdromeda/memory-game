import { ValueObject } from "../../../../shared/domain/models/ValueObject";
import { RuleBasedValidator, type ValidationRules } from "../../../../shared/domain/utils/ruleBasedValidator";
import { AuthErrorCode, UserValidationError } from "../errors/UserErrors";
import { EmailValidator } from "../utils/emailValidator";
import { PasswordValidator } from "../utils/passwordValidator";
import { UsernameValidator } from "../utils/usernameValidator";

export interface RegistrationUserDataProps {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export type RegistrationUserDataPasswordProps = Pick<RegistrationUserDataProps, "password" | "confirmPassword">;

function requiredValidation(params: { message: string; value: string }) {
  if (!params.value || params.value.trim() === "") {
    throw new UserValidationError({ message: params.message, code: AuthErrorCode.REQUIRED_FIELD_MISSING });
  }
}

const validationRules: ValidationRules<RegistrationUserDataProps> = {
  firstName: [(value: string) => requiredValidation({ value: value, message: "The first name is required." })],
  lastName: [(value: string) => requiredValidation({ value: value, message: "The last name is required." })],
  ...UsernameValidator.rules,
  ...EmailValidator.rules,
  ...PasswordValidator.rules,
};

export class RegistrationUserData extends ValueObject<RegistrationUserDataProps> {
  private constructor(props: RegistrationUserDataProps) {
    super(props);
    this.ensureAreValidFields(props);
  }

  public static create(props: RegistrationUserDataProps): RegistrationUserData {
    return new this({
      firstName: props.firstName.trim(),
      lastName: props.lastName.trim(),
      email: props.email.trim().toLowerCase(),
      username: props.username?.trim(),
      password: props.password,
      confirmPassword: props.confirmPassword,
    });
  }

  private ensureAreValidFields(props: RegistrationUserDataProps): void {
    RuleBasedValidator.validateThrowable(props, validationRules);
  }

  public static validate(props: RegistrationUserDataProps) {
    return RuleBasedValidator.validate(props, validationRules);
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get email(): string {
    return this.props.email;
  }

  get username(): string {
    return this.props.username;
  }

  get password(): string {
    return this.props.password;
  }
}
