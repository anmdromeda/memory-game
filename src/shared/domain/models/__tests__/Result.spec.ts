import { describe, expect, it } from "vitest";
import { Result } from "../Result";
import { AppError } from "../../errors/AppErrors";

describe("Result Monad - Unit Test", () => {
  describe("Success State", () => {
    it("should create a valid success instance with a specific primitive value", () => {
      const payload = "game-started";
      const result = Result.success(payload);

      expect(result.isSuccess).toBe(true);
      expect(result.getError()).toBeNull();
      expect(result.getValue()).toBe(payload);
    });

    it("should handle complex object values inside a successful outcome", () => {
      const payload = { score: 120, active: true };
      const result = Result.success(payload);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(payload);
    });
  });

  describe("Failure State", () => {
    it("should create a valid failure instance containing an explicit domain error", () => {
      const errorInstance = new AppError({ code: "" });

      const result = Result.failure({ error: errorInstance,  });

      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toBe(errorInstance);
    });

    it("should throw an InvalidResultValueAccessError when attempting to read value from a failure", () => {
      const errorInstance = new AppError({ code: "" });
      const result = Result.failure({ error: errorInstance });

      expect(() => result.getValue()).toThrow();
    });
  });
});
