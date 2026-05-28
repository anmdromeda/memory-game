import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginUseCase } from "../LoginUseCase";
import type { AuthService } from "../../domain/services/AuthService";
import type { User } from "../../domain/models/User";
import { LoginCredentials } from "../../domain/models/LoginCredentials";
import { UserValidationError } from "../../domain/errors/UserErrors";
import { UnexpectedError } from "../../../../shared/domain/errors/AppErrors";

describe("LoginUseCase - Unit Test", () => {
  let useCase: LoginUseCase;
  let mockAuthService: AuthService;

  const mockUser: User = {
    id: "user-123",
    username: "john_dev",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2026-01-01T00:00:00.000Z",
    email: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthService = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    } as unknown as AuthService;

    useCase = new LoginUseCase(mockAuthService);
  });

  it("should successfully authenticate a user and return a success Result wrapper", async () => {
    const input = { username: "john_dev", password: "securePassword123" };
    vi.mocked(mockAuthService.login).mockResolvedValue(mockUser);
    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(mockUser);
    expect(mockAuthService.login).toHaveBeenCalledWith(expect.any(LoginCredentials));
  });

  it("should catch UserValidationError domain boundaries and return an explicit failure Result", async () => {
    const input = { username: "john_dev", password: "wrong-password" };
    const domainError = new UserValidationError({
      message: "Invalid username or password.",
      code: "INVALID_CREDENTIALS",
    });

    vi.mocked(mockAuthService.login).mockRejectedValue(domainError);
    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBeInstanceOf(UserValidationError);
    expect(result.getError()?.message).toBe("Invalid username or password.");
  });

  it("should catch unchecked exceptions and mask them inside an UnexpectedError failure wrapper", async () => {
    const input = { username: "john_dev", password: "password123" };
    const nativeError = new TypeError("Network driver connection lost");

    vi.mocked(mockAuthService.login).mockRejectedValue(nativeError);
    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBeInstanceOf(UnexpectedError);
  });
});
