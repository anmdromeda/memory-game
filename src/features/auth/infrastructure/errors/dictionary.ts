import type { AppErrorCodeType } from "../../../../shared/domain/errors/AppErrors";
import type { AuthErrorCode } from "../../domain/errors/UserErrors";

export const AUTH_ERRORS_DICT: Record<keyof typeof AuthErrorCode | AppErrorCodeType, string> = {
  INVALID_EMAIL: "El formato del correo electrónico es inválido",
  INVALID_PASSWORD: "La contraseña no cumple con los requisitos de seguridad",
  REQUIRED_FIELD_MISSING: "Campo requerido",
  PASSWORDS_DOES_NOT_MATCH: "Las contraseñas no coinciden",
  INVALID_USERNAME: "El nombre de usuario contiene caracteres no permitidos o es demasiado corto",
  USER_ALREADY_EXISTS: "El correo electrónico o nombre de usuario ya está asociado con una cuenta existente",
  USER_NOT_FOUND: "No se encontró un usuario con las credenciales proporcionadas",
  INVALID_USER_DATA: "Los datos proporcionados para el usuario son inválidos",
  PERSISTENCE_FAILED:
    "Ocurrió un error al intentar guardar los datos del usuario Por favor, inténtalo de nuevo más tarde",
  TOKEN_EXPIRED: "Tu sesión ha expirado Por favor, inicia sesión nuevamente",
  SESSION_ERROR: "Ocurrió un error con tu sesión Por favor, inicia sesión nuevamente",
  INVALID_CREDENTIALS: "Los datos de acceso son incorrectos.",
  UNEXPECTED_ERROR: "Ocurrió un error inesperado Por favor, inténtalo de nuevo más tarde",
  INVALID_ARGUMENT: "Ocurrió un error con los datos proporcionados Por favor, verifica e inténtalo de nuevo",
} as const;
