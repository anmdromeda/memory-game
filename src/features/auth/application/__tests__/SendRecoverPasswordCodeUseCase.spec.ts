import { describe, it, expect, vi, beforeEach } from "vitest";
import { SendRecoverPasswordCodeUseCase } from "../SendRecoverPasswordCodeUseCase";
import type { AuthService } from "../../domain/services/AuthService";
import { UserValidationError } from "../../domain/errors/UserErrors";

describe("SendRecoverPasswordCodeUseCase - Unit Test", () => {
  let useCase: SendRecoverPasswordCodeUseCase;
  let mockAuthService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthService = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      sendRecoverPasswordCode: vi.fn(),
    } as unknown as AuthService;

    useCase = new SendRecoverPasswordCodeUseCase(mockAuthService);
  });

  it("should successfully trigger the recovery pipeline and return a success Result wrapper", async () => {
    const input = { email: "dev_recovery@email.com" };

    vi.mocked(mockAuthService.sendRecoverPasswordCode).mockResolvedValue(undefined);

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeUndefined();
    expect(mockAuthService.sendRecoverPasswordCode).toHaveBeenCalledWith("dev_recovery@email.com");
  });

  it("should return a failure Result containing a UserValidationError if the email format violates standards", async () => {
    const input = { email: "invalid-email-payload@" };

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBeInstanceOf(UserValidationError);
    expect(mockAuthService.sendRecoverPasswordCode).not.toHaveBeenCalled();
  });

  it("should return a failure Result containing a UserValidationError if the email payload is strictly empty", async () => {
    const input = { email: "   " };

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBeInstanceOf(UserValidationError);
    expect(mockAuthService.sendRecoverPasswordCode).not.toHaveBeenCalled();
  });

  it("should intercept standard infrastructure breakdowns and return them encapsulated inside a failure Result", async () => {
    const input = { email: "dev_recovery@email.com" };
    const nativeError = new Error("SMTP server failure or network timeout");

    vi.mocked(mockAuthService.sendRecoverPasswordCode).mockRejectedValue(nativeError);

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBeDefined();
  });
});
