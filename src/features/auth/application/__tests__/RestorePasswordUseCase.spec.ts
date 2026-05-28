import { describe, it, expect, vi, beforeEach } from "vitest";
import { RestorePasswordUseCase } from "../RestorePasswordUseCase";
import type { AuthService } from "../../domain/services/AuthService";
import { RuleBasedValidator } from "../../../../shared/domain/utils/ruleBasedValidator";
import { UnexpectedError } from "../../../../shared/domain/errors/AppErrors";
import { UserValidationError } from "../../domain/errors/UserErrors";

vi.mock("../../../../shared/domain/utils/ruleBasedValidator", () => ({
  RuleBasedValidator: {
    validateThrowable: vi.fn(),
  },
}));

describe("RestorePasswordUseCase - Unit Test", () => {
  let useCase: RestorePasswordUseCase;
  let mockAuthService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthService = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      sendRecoverPasswordCode: vi.fn(),
      restorePassword: vi.fn(),
    } as unknown as AuthService;

    useCase = new RestorePasswordUseCase(mockAuthService);
  });

  it("should successfully restore password and return a success Result wrapper", async () => {
    const input = {
      token: "valid-jwt-token-string",
      password: "newSecurePassword123",
      confirmPassword: "newSecurePassword123",
    };

    vi.mocked(RuleBasedValidator.validateThrowable).mockReturnValue(undefined);
    vi.mocked(mockAuthService.restorePassword).mockResolvedValue(undefined);

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeUndefined();
    expect(RuleBasedValidator.validateThrowable).toHaveBeenCalledWith(input, expect.any(Object));
    expect(mockAuthService.restorePassword).toHaveBeenCalledWith(input);
  });

  it("should throw an UnexpectedError failure early if the transaction token is empty or whitespace", async () => {
    const input = {
      token: "   ",
      password: "newSecurePassword123",
      confirmPassword: "newSecurePassword123",
    };

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBeInstanceOf(UnexpectedError);

    expect(RuleBasedValidator.validateThrowable).not.toHaveBeenCalled();
    expect(mockAuthService.restorePassword).not.toHaveBeenCalled();
  });

  it("should return a failure Result wrapping UserValidationError when password rules fail", async () => {
    const input = {
      token: "valid-token",
      password: "short",
      confirmPassword: "mismatchPassword",
    };

    const policyError = new UserValidationError({
      message: "Passwords do not match.",
      code: "PASSWORDS_DOES_NOT_MATCH",
    });

    vi.mocked(RuleBasedValidator.validateThrowable).mockImplementation(() => {
      throw policyError;
    });

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBeInstanceOf(UserValidationError);
    expect(result.getError()?.message).toBe("Passwords do not match.");
    expect(mockAuthService.restorePassword).not.toHaveBeenCalled();
  });

  it("should intercept service rejections and return them cleanly inside the failure wrapper", async () => {
    const input = {
      token: "valid-token",
      password: "newSecurePassword123",
      confirmPassword: "newSecurePassword123",
    };
    const networkError = new Error("Auth server is temporarily unavailable");

    vi.mocked(RuleBasedValidator.validateThrowable).mockReturnValue(undefined);
    vi.mocked(mockAuthService.restorePassword).mockRejectedValue(networkError);

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBeDefined();
  });
});
