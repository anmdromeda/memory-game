import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateRandomNumbers } from "../number";

describe("generateRandomNumbers - Utility Unit Test", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Happy Path (Valid Ranges & Constraints)", () => {
    it("should return an empty array if requested count is zero or negative", () => {
      expect(generateRandomNumbers({ min: 1, max: 10, count: 0 })).toEqual([]);
    });

    it("should generate unique numbers within the exact boundaries when allowDuplicates is false", () => {
      const config = { min: 1, max: 5, count: 5, allowDuplicates: false };

      const result = generateRandomNumbers(config);

      expect(result).toHaveLength(5);

      result.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(5);
      });

      expect(new Set(result).size).toBe(5);
    });

    it("should correctly allow duplicates when explicitly configured to true", () => {
      vi.mocked(Math.random).mockReturnValue(0.1);

      const config = { min: 1, max: 5, count: 3, allowDuplicates: true };
      const result = generateRandomNumbers(config);

      expect(result).toEqual([1, 1, 1]);
    });
  });

  describe("Validation Guards (Defensive Invariants)", () => {
    it("should throw an AppError with RANDOM_INVALID_RANGE if min is strictly greater than max", () => {
      const invalidConfig = { min: 10, max: 5, count: 2 };

      expect(() => generateRandomNumbers(invalidConfig)).toThrow(
        expect.objectContaining({
          code: "RANDOM_INVALID_RANGE",
          message: "The 'min' value (10) cannot be greater than the 'max' value (5).",
        }),
      );
    });

    it("should throw an AppError with RANDOM_EXCEEDED_COUNT if unique count requested exceeds max possible options", () => {
      const invalidConfig = { min: 1, max: 3, count: 4, allowDuplicates: false };

      expect(() => generateRandomNumbers(invalidConfig)).toThrow(
        expect.objectContaining({
          code: "RANDOM_EXCEEDED_COUNT",
          message: "Cannot generate 4 unique random numbers within a range of 3 total possibilities.",
        }),
      );
    });
  });
});
