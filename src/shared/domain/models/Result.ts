import { AppError } from "../errors/AppErrors";

export const ResultErrorCode = {
  InvalidContract: "RESULT_INVALID_CONTRACT",
  ForbiddenValueAccess: "RESULT_FORBIDDEN_VALUE_ACCESS",
} as const;

export type ResultErrorCodeType = (typeof ResultErrorCode)[keyof typeof ResultErrorCode];

export class InvalidResultContractError extends AppError {
  constructor(reason: string) {
    super({
      message: `Result pattern violation: ${reason}`,
      code: ResultErrorCode.InvalidContract,
    });
  }
}

export class InvalidResultValueAccessError extends AppError {
  constructor() {
    super({
      message: "Cannot access the value of a failed result. Check 'isSuccess' before calling getValue().",
      code: ResultErrorCode.ForbiddenValueAccess,
    });
  }
}

export class Result<T = void> {
  private constructor(
    readonly isSuccess: boolean,
    private readonly error: AppError | null,
    private readonly value: T | null,
  ) {
    if (isSuccess && error) {
      throw new InvalidResultContractError("A successful result cannot contain an error.");
    }

    if (!isSuccess && !error) {
      throw new InvalidResultContractError("A failed result must contain an error.");
    }
  }

  public static success<U>(value: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  public static failure<U>(params: { error: AppError }): Result<U> {
    return new Result<U>(false, params.error, null);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new InvalidResultValueAccessError();
    }

    return this.value as T;
  }

  public getError() {
    return this.error;
  }
}
