export const AppErrorCode = {
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
  INVALID_ARGUMENT_ERROR: "INVALID_ARGUMENT",
} as const;

export type AppErrorCodeType = (typeof AppErrorCode)[keyof typeof AppErrorCode];

export class AppError extends Error {
  readonly code: string;

  constructor(params: { message?: string; code: string }) {
    super(params.message);
    this.code = params.code;
  }
}

export class UnexpectedError extends AppError {
  readonly cause?: unknown;

  constructor(params?: { message?: string }) {
    super({
      message: params?.message || "An unexpected error occurred. Please try again later.",
      code: AppErrorCode.UNEXPECTED_ERROR,
    });
  }
}

export class InvalidArgumentError extends AppError {
  constructor(property: string, invalidValue: string) {
    super({
      message: `The value "${invalidValue}" provided for "${property}" is invalid.`,
      code: AppErrorCode.INVALID_ARGUMENT_ERROR,
    });
  }
}
