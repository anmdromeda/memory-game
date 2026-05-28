import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocalStorageUserRepository } from "../LocalUserRepository";
import type { UserEntity, UserRepository } from "../../../domain/repository/UserRepository";
import { UserAlreadyExistsError, UserNotFoundError, UserPersistenceError } from "../../../domain/errors/UserErrors";

vi.mock("bcryptjs", () => ({
  default: {
    genSalt: vi.fn().mockResolvedValue("mock-salt"),
    hash: vi.fn().mockResolvedValue("mock-hashed-password"),
  },
}));

describe("LocalStorageUserRepository - Unit Test", () => {
  let repository: UserRepository;
  const STORAGE_KEY = "app_users";

  const mockUserEntities: UserEntity[] = [
    {
      id: "user-1",
      firstName: "John",
      lastName: "Doe",
      username: "john_dev",
      passwordHash: "hash-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      email: "",
    },
    {
      id: "user-2",
      firstName: "Jane",
      lastName: "Smith",
      username: "jane_s",
      passwordHash: "hash-2",
      createdAt: "2026-01-02T00:00:00.000Z",
      email: "",
    },
  ];

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
    });
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(),
    });
    repository = new LocalStorageUserRepository();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("findByUsername", () => {
    it("should return the full UserEntity matching the given username case-insensitively", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserEntities));

      const result = await repository.findByUsername("JOHN_DEV");

      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(result).toEqual(mockUserEntities[0]);
    });

    it("should return null if no entity matches the requested username", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserEntities));

      const result = await repository.findByUsername("unknown_user");

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return the public User schema mapping correctly without password data", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserEntities));

      const result = await repository.findById("user-1");

      expect(result).not.toHaveProperty("passwordHash");
      expect(result?.id).toBe("user-1");
      expect(result?.username).toBe("john_dev");
    });

    it("should return null if target id does not exist in local state records", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserEntities));

      const result = await repository.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should hash the plain password and safely persist the new UserEntity layer", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserEntities));
      vi.mocked(crypto.randomUUID).mockReturnValue(
        "new-random-uuid" as `${string}-${string}-${string}-${string}-${string}`,
      );

      const input = {
        firstName: "Alice",
        lastName: "Wonder",
        username: "alice_w",
        password: "clear-text-password",
        email: "alice@email.com",
      };

      const result = await repository.create(input);

      expect(result.id).toBe("new-random-uuid");
      expect(result.username).toBe(input.username);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('"passwordHash":"mock-hashed-password"'),
      );
    });

    it("should throw a UserAlreadyExistsError if there is a conflict matching usernames", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserEntities));

      const input = {
        firstName: "John",
        lastName: "Clone",
        username: "john_dev",
        password: "12345678",
        email: "john@email.com",
      };

      await expect(repository.create(input)).rejects.toThrow(UserAlreadyExistsError);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should partial update editable fields and maintain immutable keys safe", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserEntities));

      const updateInput = { firstName: "John New Name" };
      const result = await repository.update("user-1", updateInput);

      expect(result?.id).toBe("user-1");
      expect(result?.firstName).toBe("John New Name");
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it("should throw a UserNotFoundError if domain aggregate is missing on storage", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserEntities));

      await expect(repository.update("ghost-id", { firstName: "NoOne" })).rejects.toThrow(UserNotFoundError);
    });
  });

  describe("delete", () => {
    it("should filter the target out of state array and save changes returns true", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserEntities));

      const result = await repository.delete("user-1");

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify([mockUserEntities[1]]));
    });

    it("should bypass mutations and return false if target entity index is missing", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserEntities));

      const result = await repository.delete("non-existent");

      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("Driver Invariants / Write Exceptions", () => {
    it("should intercept structural platform IO boundaries with UserPersistenceError", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserEntities));
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error("QuotaExceededError - Disk Full");
      });

      await expect(repository.update("user-1", { firstName: "Crash" })).rejects.toThrow(UserPersistenceError);
    });
  });
});
