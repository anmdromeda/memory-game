import { ValueObject } from "../../../../shared/domain/models/ValueObject";
import { RuleBasedValidator, type ValidationRules } from "../../../../shared/domain/utils/ruleBasedValidator";
import { PasswordValidator } from "../utils/passwordValidator";
import { UsernameValidator } from "../utils/usernameValidator";

export interface LoginCredentialsProps {
  username: string;
  password: string;
}

const validationRules: ValidationRules<LoginCredentialsProps> = {
  username: [UsernameValidator.ensureNotEmpty],
  password: [PasswordValidator.ensureNotEmpty],
};

export class LoginCredentials extends ValueObject<LoginCredentialsProps> {
  private constructor(props: LoginCredentialsProps) {
    super(props);
    this.ensureAreValidFields(props);
  }

  public static create(props: LoginCredentialsProps): LoginCredentials {
    return new this({
      username: props.username.trim().toLowerCase(),
      password: props.password,
    });
  }

  private ensureAreValidFields(props: LoginCredentialsProps): void {
    RuleBasedValidator.validateThrowable(props, validationRules);
  }

  static validate(props: LoginCredentialsProps) {
    return RuleBasedValidator.validate(props, validationRules);
  }

  get username(): string {
    return this.props.username;
  }

  get password(): string {
    return this.props.password;
  }
}
