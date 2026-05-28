import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterUseCase } from "../RegisterUseCase";
import type { AuthService } from "../../domain/services/AuthService";
import type { User } from "../../domain/models/User";
import { RegistrationUserData } from "../../domain/models/RegistrationUserData";
import { UserValidationError } from "../../domain/errors/UserErrors";
import { UnexpectedError } from "../../../../shared/domain/errors/AppErrors";

describe("RegisterUseCase - Unit Test", () => {
  let useCase: RegisterUseCase;
  let mockAuthService: AuthService;

  const mockUser: User = {
    id: "new-user-uuid",
    username: "angel_core",
    firstName: "Angel",
    lastName: "Core",
    createdAt: "2026-05-18T22:30:00.000Z",
    email: "angelcore@email.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthService = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    } as unknown as AuthService;

    useCase = new RegisterUseCase(mockAuthService);
  });

  it("should successfully register a user and return a success Result wrapper", async () => {
    const input = {
      firstName: "Angel",
      lastName: "Core",
      username: "angel_core",
      email: "angelcore@email.com",
      password: "securePassword123",
      confirmPassword: "securePassword123",
    };

    vi.mocked(mockAuthService.register).mockResolvedValue(mockUser);
    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(mockUser);
    expect(mockAuthService.register).toHaveBeenCalledWith(expect.any(RegistrationUserData));
  });

  it("should catch UserValidationError domain boundaries and return a failure Result", async () => {
    const input = {
      firstName: "Angel",
      lastName: "Core",
      username: "angel_duplicate",
      email: "duplicate@email.com",
      password: "securePassword123",
      confirmPassword: "securePassword123",
    };

    const domainError = new UserValidationError({
      message: "Username already exists.",
      code: "USERNAME_ALREADY_EXISTS",
    });

    vi.mocked(mockAuthService.register).mockRejectedValue(domainError);
    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBeInstanceOf(UserValidationError);
    expect(result.getError()?.message).toBe("Username already exists.");
  });

  it("should intercept native unchecked exceptions and warp them inside an UnexpectedError failure wrapper", async () => {
    const input = {
      firstName: "Angel",
      lastName: "Core",
      username: "angel_core",
      email: "deadlock@email.com",
      password: "securePassword123",
      confirmPassword: "securePassword123",
    };
    const nativeError = new Error("Database deadlock or connection breakdown");

    vi.mocked(mockAuthService.register).mockRejectedValue(nativeError);
    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBeInstanceOf(UnexpectedError);
  });
});
