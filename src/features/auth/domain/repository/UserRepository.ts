import type { Repository } from "../../../../shared/domain/models/Repository";
import type { User } from "../models/User";

export interface UserEntity extends User {
  passwordHash: string;
}

export interface UserRepository extends Repository<User> {
  findByUsername(username: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(item: Omit<User, "createdAt" | "id"> & { password: string }): Promise<User>;
  updatePassword(userId: string, newPassword: string): Promise<User>;
}
