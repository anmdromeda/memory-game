import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserEntity, UserRepository } from "../../../domain/repository/UserRepository";
import type { AuthService } from "../../../domain/services/AuthService";
import type { User } from "../../../domain/models/User";
import { AppAuthService, InvalidCredentialsError } from "../AppAuthService";
import bcrypt from "bcryptjs";
import { AppError } from "../../../../../shared/domain/errors/AppErrors";
import { LoginCredentials } from "../../../domain/models/LoginCredentials";
import { RegistrationUserData } from "../../../domain/models/RegistrationUserData";

vi.mock("bcryptjs", () => ({
  default: {
    genSalt: vi.fn(),
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe("AppAuthService - Unit Test", () => {
  let mockUserRepository: UserRepository;
  let authService: AuthService;

  const mockUserEntity: UserEntity = {
    id: "user-123",
    username: "john_dev",
    firstName: "John",
    lastName: "Doe",
    passwordHash: "hashed-password-string",
    createdAt: "2026-01-01T00:00:00.000Z",
    email: "",
  };

  const mockPublicUser: User = {
    id: "user-123",
    username: "john_dev",
    firstName: "John",
    lastName: "Doe",
    createdAt: "2026-01-01T00:00:00.000Z",
    email: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserRepository = {
      findByUsername: vi.fn(),
      create: vi.fn(),
    } as unknown as UserRepository;

    authService = new AppAuthService(mockUserRepository);
  });

  describe("login", () => {
    it("should authenticate user and return public entity data when credentials match", async () => {
      vi.mocked(mockUserRepository.findByUsername).mockResolvedValue(mockUserEntity);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const credentials: LoginCredentials = LoginCredentials.create({
        username: "john_dev",
        password: "correct-password",
      });

      const result = await authService.login(credentials);

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(credentials.username);
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUserEntity.passwordHash);
      expect(result).toEqual(mockPublicUser);
    });

    it("should throw an InvalidCredentialsError if user account could not be found by username", async () => {
      vi.mocked(mockUserRepository.findByUsername).mockResolvedValue(null);

      const credentials = LoginCredentials.create({ username: "wrong_user", password: "password" });

      await expect(authService.login(credentials)).rejects.toThrow(InvalidCredentialsError);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw an InvalidCredentialsError if password comparison returns false", async () => {
      vi.mocked(mockUserRepository.findByUsername).mockResolvedValue(mockUserEntity);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const credentials = LoginCredentials.create({ username: "john_dev", password: "wrong-password" });

      await expect(authService.login(credentials)).rejects.toThrow(InvalidCredentialsError);
    });
  });

  describe("register", () => {
    it("should delegate new user creation data directly to the repository abstraction layer", async () => {
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockPublicUser);

      const registrationData = RegistrationUserData.create({
        firstName: "John",
        lastName: "Doe",
        username: "new_user",
        email: "newuser@email.com",
        password: "secure-password",
        confirmPassword: "secure-password",
      });

      const result = await authService.register(registrationData);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        username: registrationData.username,
        email: registrationData.email,
        password: registrationData.password,
      });
      expect(result).toEqual(mockPublicUser);
    });

    it("should rethrow exceptions extending from domain standard AppError", async () => {
      const standardError = new AppError({ message: "Username already exists", code: "409" });
      vi.mocked(mockUserRepository.create).mockRejectedValue(standardError);

      const registrationData = RegistrationUserData.create({
        firstName: "John",
        lastName: "Doe",
        username: "dup_user",
        email: "dupuser@email.com",
        password: "12345678",
        confirmPassword: "12345678",
      });

      await expect(authService.register(registrationData)).rejects.toThrow(standardError);
    });
  });

  describe("logout", () => {
    it("should resolve immediately with no operational payload", async () => {
      await expect(authService.logout()).resolves.toBeUndefined();
    });
  });
});
