import { describe, it, expect, vi, beforeEach } from "vitest";
import { RetrieveUserInfoUseCase } from "../RetrieveUserInfoUseCase";
import type { AuthService } from "../../domain/services/AuthService";
import type { User } from "../../domain/models/User";
import { UserValidationError } from "../../domain/errors/UserErrors";
import { UnexpectedError } from "../../../../shared/domain/errors/AppErrors";

describe("RetrieveUserInfoUseCase - Unit Test", () => {
  let useCase: RetrieveUserInfoUseCase;
  let mockAuthService: AuthService;

  const mockUser: User = {
    id: "user-999",
    username: "angel_session",
    firstName: "Angel",
    lastName: "Core",
    createdAt: "2026-05-20T12:00:00.000Z",
    email: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthService = {
      getUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    } as unknown as AuthService;

    useCase = new RetrieveUserInfoUseCase(mockAuthService);
  });

  describe("Happy Path", () => {
    it("should successfully retrieve user information from session and return a success Result wrapper", async () => {
      vi.mocked(mockAuthService.getUser).mockResolvedValue(mockUser);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(mockUser);
      expect(mockAuthService.getUser).toHaveBeenCalledTimes(1);
    });

    it("should return a success Result wrapping null if no active session or authenticated user exists", async () => {
      vi.mocked(mockAuthService.getUser).mockResolvedValue(null);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBeNull();
    });
  });

  describe("Defensive Guard & Boundary Exceptions", () => {
    it("should intercept a domain UserValidationError and map it cleanly to a failure Result", async () => {
      const domainError = new UserValidationError({
        message: "Session has expired or token is invalid.",
        code: "UNAUTHORIZED",
      });
      vi.mocked(mockAuthService.getUser).mockRejectedValue(domainError);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toBeInstanceOf(UserValidationError);
      expect(result.getError()?.message).toBe("Session has expired or token is invalid.");
    });

    it("should trap unexpected infrastructure or native driver failures inside an UnexpectedError wrapper", async () => {
      const systemCrash = new EvalError("Memory buffer leaking stack overflow");
      vi.mocked(mockAuthService.getUser).mockRejectedValue(systemCrash);

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toBeInstanceOf(UnexpectedError);
    });
  });
});
