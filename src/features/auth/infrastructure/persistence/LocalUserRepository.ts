import { UserAlreadyExistsError, UserNotFoundError, UserPersistenceError } from "../../domain/errors/UserErrors";
import type { User } from "../../domain/models/User";
import type { UserEntity, UserRepository } from "../../domain/repository/UserRepository";
import { BcryptCryptoEngine } from "../utils/byCryptEngine";

export class LocalStorageUserRepository implements UserRepository {
  private readonly STORAGE_KEY = "app_users";
  private readonly cryptoEngine = new BcryptCryptoEngine();

  private getUsersFromStorage(): UserEntity[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const users = this.getUsersFromStorage();
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    return user ? { ...user } : null;
  }

  private isExistingUser(users: UserEntity[], item: Omit<User, "createdAt" | "id">) {
    return users.some((dbUser) => {
      const emailExists = dbUser.email.toLowerCase() === item.email.toLowerCase();
      const usernameExists = dbUser.username.toLowerCase() === item.username.toLowerCase();

      return emailExists || usernameExists;
    });
  }

  async create(item: User & { password: string }): Promise<User> {
    const users = this.getUsersFromStorage();

    if (this.isExistingUser(users, item)) {
      throw new UserAlreadyExistsError();
    }

    const hashedPassword = item.password ? await this.cryptoEngine.hash(item.password) : "";

    const newUserEntity: UserEntity = {
      username: item.username,
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,
      id: crypto.randomUUID(),
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUserEntity);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));

    return this.toUserWithoutPassword(newUserEntity);
  }

  private saveUsersToStorage(users: UserEntity[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      throw new UserPersistenceError("write", error);
    }
  }

  async findById(id: string): Promise<User | null> {
    const users = this.getUsersFromStorage();
    const user = users.find((u) => u.id === id);
    return user ? this.toUserWithoutPassword({ ...user }) : null;
  }

  async update(id: string, item: Partial<Omit<User, "id" | "createdAt">>): Promise<User> {
    const users = this.getUsersFromStorage();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new UserNotFoundError(id);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...item,
      id: users[userIndex].id,
      createdAt: users[userIndex].createdAt,
    };

    this.saveUsersToStorage(users);
    return this.toUserWithoutPassword({ ...users[userIndex] });
  }

  async delete(id: string): Promise<boolean> {
    const users = this.getUsersFromStorage();
    const initialLength = users.length;

    const filteredUsers = users.filter((u) => u.id !== id);

    if (filteredUsers.length === initialLength) {
      return false;
    }

    try {
      this.saveUsersToStorage(filteredUsers);
      return true;
    } catch (error) {
      throw new UserPersistenceError("delete", error);
    }
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    const users = this.getUsersFromStorage();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  public async updatePassword(userId: string, newPassword: string): Promise<User> {
    const users = this.getUsersFromStorage();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new UserNotFoundError(userId);
    }

    const hashedPassword = await this.cryptoEngine.hash(newPassword);

    if (userIndex === -1) {
      throw new UserNotFoundError(userId);
    }

    users[userIndex] = {
      ...users[userIndex],
      passwordHash: hashedPassword,
      id: users[userIndex].id,
      createdAt: users[userIndex].createdAt,
    };

    this.saveUsersToStorage(users);
    return this.toUserWithoutPassword({ ...users[userIndex] });
  }

  private toUserWithoutPassword(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      username: entity.username,
      firstName: entity.firstName,
      lastName: entity.lastName,
      createdAt: entity.createdAt,
    };
  }
}
