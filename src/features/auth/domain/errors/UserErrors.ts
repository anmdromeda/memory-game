import { AppError } from "../../../../shared/domain/errors/AppErrors";

export const AuthErrorCode = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  INVALID_USER_DATA: "INVALID_USER_DATA",
  PERSISTENCE_FAILED: "PERSISTENCE_FAILED",
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_PASSWORD: "INVALID_PASSWORD",
  REQUIRED_FIELD_MISSING: "REQUIRED_FIELD_MISSING",
  PASSWORDS_DOES_NOT_MATCH: "PASSWORDS_DOES_NOT_MATCH",
  INVALID_USERNAME: "INVALID_USERNAME",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  SESSION_ERROR: "SESSION_ERROR",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
} as const;

export class UserValidationError extends AppError {
  constructor({ message, code }: { message: string; code: string }) {
    super({ message, code });
  }
}

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

export class UserNotFoundError extends AppError {
  constructor(identifier: string) {
    super({
      message: `User with identifier '${identifier}' could not be found.`,
      code: AuthErrorCode.USER_NOT_FOUND,
    });
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor() {
    super({
      message: `The email or username is already associated with an existing account.`,
      code: AuthErrorCode.USER_ALREADY_EXISTS,
    });
  }
}

export class InvalidUserDataError extends AppError {
  constructor(property: string, details?: string) {
    super({
      message: `Invalid user data provided for property '${property}'. ${details ?? ""}`.trim(),
      code: AuthErrorCode.INVALID_USER_DATA,
    });
  }
}

export class UserPersistenceError extends AppError {
  readonly originalError?: unknown;

  constructor(operation: "read" | "write" | "delete", originalError?: unknown) {
    super({
      message: `Critical failure occurred during user storage operation ${operation}.`,
      code: AuthErrorCode.PERSISTENCE_FAILED,
    });
    this.originalError = originalError;
  }
}
