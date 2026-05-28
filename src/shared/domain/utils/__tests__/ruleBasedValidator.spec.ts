import { describe, it, expect, vi } from "vitest";
import { RuleBasedValidator, type ValidationHandler, type ValidationRules } from "../ruleBasedValidator";

interface MockAppError {
  message: string;
  code?: string;
}

interface TestTargetData {
  username: string;
  age: number;
}

describe("RuleBasedValidator - Comprehensive Unit Tests", () => {
  describe("validate()", () => {
    it("should return null when all handlers pass without throwing errors", () => {
      const validData: TestTargetData = { username: "angel_dev", age: 25 };

      const mockHandler: ValidationHandler = vi.fn();
      const rules: ValidationRules<TestTargetData> = {
        username: [mockHandler],
        age: [mockHandler],
      };

      const errors = RuleBasedValidator.validate(validData, rules);

      expect(errors).toBeNull();
      expect(mockHandler).toHaveBeenCalledTimes(2);
    });

    it("should catch exceptions, extract messages, and map them to their corresponding property keys", () => {
      const invalidData: TestTargetData = { username: "", age: 15 };

      const failingUsernameHandler: ValidationHandler = () => {
        throw { code: "USERNAME_EMPTY" } as MockAppError;
      };
      const failingAgeHandler: ValidationHandler = () => {
        throw { code: "AGE_TOO_YOUNG" } as MockAppError;
      };

      const rules: ValidationRules<TestTargetData> = {
        username: [failingUsernameHandler],
        age: [failingAgeHandler],
      };

      const errors = RuleBasedValidator.validate(invalidData, rules);

      expect(errors).not.toBeNull();
      expect(errors).toEqual({
        username: "USERNAME_EMPTY",
        age: "AGE_TOO_YOUNG",
      });
    });

    it("should break execution for a specific field on the first failing handler and ignore subsequent handlers for that field", () => {
      const testData: TestTargetData = { username: "invalid_user", age: 30 };

      const firstFailingHandler: ValidationHandler = () => {
        throw { code: "CUSTOM_CODE" } as MockAppError;
      };
      const secondHandlerAfterFail: ValidationHandler = vi.fn();

      const rules: ValidationRules<TestTargetData> = {
        username: [firstFailingHandler, secondHandlerAfterFail],
      };

      const errors = RuleBasedValidator.validate(testData, rules);

      expect(errors).toEqual({
        username: "CUSTOM_CODE",
      });

      expect(secondHandlerAfterFail).not.toHaveBeenCalled();
    });

    it("should fallback to a default message if the caught exception does not contain a valid 'message' property", () => {
      const testData: TestTargetData = { username: "user", age: 20 };

      const rawFailingHandler: ValidationHandler = () => {
        throw new Error("");
      };

      const rules: ValidationRules<TestTargetData> = {
        username: [rawFailingHandler],
      };

      const errors = RuleBasedValidator.validate(testData, rules);

      expect(errors).toEqual({
        username: "UNEXPECTED_ERROR",
      });
    });

    it("should process structural properties safely, ignoring empty or undefined handler arrays", () => {
      const testData: TestTargetData = { username: "valid", age: 20 };

      const rules: ValidationRules<TestTargetData> = {
        username: undefined,
        age: [],
      };

      const errors = RuleBasedValidator.validate(testData, rules);

      expect(errors).toBeNull();
    });
  });

  describe("validateThrowable()", () => {
    it("should execute all handlers silently and return void when no rule throws an exception", () => {
      const validData: TestTargetData = { username: "angel_dev", age: 25 };

      const mockUsernameHandler = vi.fn();
      const mockAgeHandler = vi.fn();

      const rules: ValidationRules<TestTargetData> = {
        username: [mockUsernameHandler],
        age: [mockAgeHandler],
      };

      expect(() => RuleBasedValidator.validateThrowable(validData, rules)).not.toThrow();

      expect(mockUsernameHandler).toHaveBeenCalledTimes(1);
      expect(mockUsernameHandler).toHaveBeenCalledWith("angel_dev", validData);

      expect(mockAgeHandler).toHaveBeenCalledTimes(1);
      expect(mockAgeHandler).toHaveBeenCalledWith(25, validData);
    });

    it("should escalate the exception immediately when any handler throws an error", () => {
      const invalidData: TestTargetData = { username: "invalid_user", age: 16 };

      const failingAgeHandler: ValidationHandler = () => {
        throw new Error("Age verification failed.");
      };
      const nextHandlerInQueue = vi.fn();

      const rules: ValidationRules<TestTargetData> = {
        age: [failingAgeHandler, nextHandlerInQueue],
      };

      expect(() => RuleBasedValidator.validateThrowable(invalidData, rules)).toThrow("Age verification failed.");
      expect(nextHandlerInQueue).not.toHaveBeenCalled();
    });

    it("should completely skip execution fields or properties that have no validation handlers assigned", () => {
      const testData: TestTargetData = { username: "vanilla_code", age: 30 };

      const rules: ValidationRules<TestTargetData> = {
        username: undefined,
        age: [],
      };

      expect(() => RuleBasedValidator.validateThrowable(testData, rules)).not.toThrow();
    });
  });
});
