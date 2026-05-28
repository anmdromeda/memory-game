import type { AppErrorCodeType } from "../../domain/errors/AppErrors";

export const SHARED_ERRORS_DICT: Record<AppErrorCodeType, string> = {
  UNEXPECTED_ERROR: "Ha ocurrido un error inesperado. Por favor, intenta nuevamente más tarde.",
  INVALID_ARGUMENT: "El valor proporcionado para un argumento es inválido.",
} as const;
