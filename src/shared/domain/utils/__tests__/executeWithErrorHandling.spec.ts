import { describe, it, expect, vi } from "vitest";
import { executeWithErrorHandling } from "../excecuteWithErrorHandling";
import { AppError, UnexpectedError } from "../../errors/AppErrors";

describe("executeWithErrorHandling - Infrastructure Exception Interceptor", () => {
  describe("Happy Path Execution", () => {
    it("should resolve and return the inner asynchronous operation payload when successful", async () => {
      const mockResult = { token: "jwt-mock-payload" };
      const actionFn = vi.fn().mockResolvedValue(mockResult);
      const onErrorFn = vi.fn();

      const result = await executeWithErrorHandling(actionFn, onErrorFn);

      expect(result).toEqual(mockResult);
      expect(actionFn).toHaveBeenCalledTimes(1);
      expect(onErrorFn).not.toHaveBeenCalled();
    });
  });

  describe("Domain Exception Interception (AppError)", () => {
    it("should intercept known domain AppError instances and delegate them cleanly to the onError callback", async () => {
      const targetDomainError = new AppError({
        message: "Invalid credentials format",
        code: "UNEXPECTED_ERROR",
      });

      const actionFn = vi.fn().mockRejectedValue(targetDomainError);
      const onErrorFn = vi.fn().mockReturnValue({ success: false, data: null });

      const result = await executeWithErrorHandling(actionFn, onErrorFn);

      expect(actionFn).toHaveBeenCalledTimes(1);
      expect(onErrorFn).toHaveBeenCalledTimes(1);
      expect(onErrorFn).toHaveBeenCalledWith(targetDomainError);
      expect(result).toEqual({ success: false, data: null });
    });
  });

  describe("Unknown Exception Fallback (UnexpectedError)", () => {
    it("should catch native generic runtime exceptions and normalize them into an UnexpectedError instance", async () => {
      const nativeError = new TypeError("Failed to fetch resource on URI");
      const actionFn = vi.fn().mockRejectedValue(nativeError);
      const onErrorFn = vi.fn().mockReturnValue("fallback-string-route");

      const result = await executeWithErrorHandling(actionFn, onErrorFn);

      expect(actionFn).toHaveBeenCalledTimes(1);
      expect(onErrorFn).toHaveBeenCalledTimes(1);

      const interceptedError = onErrorFn.mock.calls[0][0];
      expect(interceptedError).toBeInstanceOf(UnexpectedError);
      expect(interceptedError).toBeInstanceOf(AppError);
      expect(interceptedError.code).toBe("UNEXPECTED_ERROR");
      expect(result).toBe("fallback-string-route");
    });
  });
});
