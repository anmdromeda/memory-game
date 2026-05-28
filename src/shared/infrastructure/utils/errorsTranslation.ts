import type { Result } from "../models/Result";

export function translateValidationErrors<T extends object>(
  errors: Partial<Record<keyof T, string>>,
  dictionary: Record<string, string>,
): Partial<Record<keyof T, string>> {
  const translatedErrors: Partial<Record<keyof T, string>> = {};

  for (const key in errors) {
    translatedErrors[key as keyof T] = dictionary[errors[key as keyof T] as string] || "Invalid value";
  }

  return translatedErrors;
}

export function translateResultError(result: Result<unknown>, dictionary: Record<string, string>): string {
  if (result.isSuccess) {
    return "";
  }

  const error = result.getError();

  if (!error) {
    return "";
  }

  return dictionary[error.code as keyof typeof dictionary] || "An unknown error occurred";
}
