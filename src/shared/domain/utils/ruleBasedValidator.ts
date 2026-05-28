import { AppErrorCode, type AppError } from "../errors/AppErrors";

export type ValidationHandler<T extends object = object> = (value: string, props: T) => void;
export type ValidationRules<T extends object = object> = Partial<Record<keyof T, ValidationHandler<T>[]>>;

export class RuleBasedValidator {
  public static validate<T extends object = object>(
    data: T,
    rules: ValidationRules<T>,
  ): Partial<Record<keyof T, string>> | null {
    const errors: Partial<Record<keyof T, string>> = {};

    for (const field in rules) {
      if (!Object.prototype.hasOwnProperty.call(rules, field)) continue;

      const prop = field as keyof T;
      const handlers = rules[prop];

      if (!handlers) continue;

      for (const handler of handlers) {
        try {
          handler(data[prop] as string, data);
        } catch (error) {
          const appError = error as AppError;
          errors[prop] = appError.code || AppErrorCode.UNEXPECTED_ERROR;
          break;
        }
      }
    }

    return Object.keys(errors).length > 0 ? (errors as Record<keyof T, string>) : null;
  }

  public static validateThrowable<T extends object = object>(data: T, rules: ValidationRules<T>) {
    for (const field in rules) {
      const prop = field as keyof typeof data;

      rules[prop]?.forEach((handler) => {
        handler(data[prop] as string, data);
      });
    }
  }
}
