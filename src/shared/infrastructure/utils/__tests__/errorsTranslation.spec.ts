import { describe, it, expect } from "vitest";
import { translateResultError, translateValidationErrors } from "../errorsTranslation";
import type { Result } from "../../../domain/models/Result";

describe("Translation Utilities - Functional Transformation Unit Tests", () => {
  const mockDictionary = {
    "auth.username.required": "El nombre de usuario es obligatorio.",
    "auth.password.too_short": "La contraseña debe tener al menos 6 caracteres.",
    "network.server_error": "Error interno del servidor. Inténtalo de nuevo.",
  };

  describe("translateValidationErrors Flow", () => {
    interface MockCredentials {
      username: string;
      password?: string;
    }

    it("should successfully map internal error codes into localized translation strings", () => {
      const incomingErrors: Partial<Record<keyof MockCredentials, string>> = {
        username: "auth.username.required",
        password: "auth.password.too_short",
      };

      const result = translateValidationErrors<MockCredentials>(incomingErrors, mockDictionary);

      expect(result).toEqual({
        username: "El nombre de usuario es obligatorio.",
        password: "La contraseña debe tener al menos 6 caracteres.",
      });
    });

    it("should gracefully fallback to 'Invalid value' when an error code does not exist in the dictionary", () => {
      const incomingErrors: Partial<Record<keyof MockCredentials, string>> = {
        username: "unknown.error.code",
      };

      const result = translateValidationErrors<MockCredentials>(incomingErrors, mockDictionary);

      expect(result.username).toBe("Invalid value");
    });

    it("should return an empty object immediately if no validation errors are provided", () => {
      const result = translateValidationErrors<MockCredentials>({}, mockDictionary);
      expect(result).toEqual({});
    });
  });

  describe("translateResultError Flow", () => {
    const createMockResult = (isSuccess: boolean, errorCode: string | null = null): Result<unknown> => {
      return {
        isSuccess,
        getValue: () => null,
        getError: () => (errorCode ? { code: errorCode } : null),
      } as unknown as Result<unknown>;
    };

    it("should immediately return an empty string if the domain transaction was successful", () => {
      const successResult = createMockResult(true);
      const output = translateResultError(successResult, mockDictionary);

      expect(output).toBe("");
    });

    it("should extract code and map localized value from dictionary when transaction is a failure", () => {
      const failureResult = createMockResult(false, "network.server_error");
      const output = translateResultError(failureResult, mockDictionary);

      expect(output).toBe("Error interno del servidor. Inténtalo de nuevo.");
    });

    it("should fallback to 'An unknown error occurred' if the failure code is omitted or not in dictionary", () => {
      const unregisteredFailure = createMockResult(false, "critical.db_crash");
      const output = translateResultError(unregisteredFailure, mockDictionary);

      expect(output).toBe("An unknown error occurred");
    });

    it("should return an empty string defensively if result is a failure but getError() resolves to null", () => {
      const corruptFailure = createMockResult(false, null);
      const output = translateResultError(corruptFailure, mockDictionary);

      expect(output).toBe("");
    });
  });
});
