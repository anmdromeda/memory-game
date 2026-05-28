import { AppError, UnexpectedError } from "../errors/AppErrors";

export async function executeWithErrorHandling<R, E extends AppError = AppError>(
  fn: () => Promise<R>,
  onError: (error: E | UnexpectedError) => R,
): Promise<R> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof AppError) {
      return onError(error as E);
    }

    return onError(new UnexpectedError());
  }
}
