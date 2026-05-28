import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogoutUseCase } from "../LogoutUseCase";
import type { AuthService } from "../../domain/services/AuthService";
import { UnexpectedError } from "../../../../shared/domain/errors/AppErrors";

describe("LogoutUseCase - Unit Test", () => {
  let useCase: LogoutUseCase;
  let mockAuthService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthService = {
      logout: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      getUser: vi.fn(),
    } as unknown as AuthService;

    useCase = new LogoutUseCase(mockAuthService);
  });

  it("should successfully log out the user and return a success Result object", async () => {
    vi.mocked(mockAuthService.logout).mockResolvedValue(undefined);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({ isLoggedOut: true });
    expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
  });

  it("should catch exceptions from the auth service and map them into an UnexpectedError failure Result", async () => {
    const nativeError = new Error("Session destruction timeout on data store");
    vi.mocked(mockAuthService.logout).mockRejectedValue(nativeError);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBeInstanceOf(UnexpectedError);
  });
});
