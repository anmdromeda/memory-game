import type { LoginCredentials } from "../models/LoginCredentials";
import type { RegistrationUserData, RegistrationUserDataProps } from "../models/RegistrationUserData";
import type { User } from "../models/User";

export type RestorePasswordParams = Pick<RegistrationUserDataProps, "password" | "confirmPassword"> & { token: string };
export interface AuthService {
  login(credentials: LoginCredentials): Promise<User>;
  register(userData: RegistrationUserData): Promise<User>;
  logout(): Promise<void>;
  getUser(): Promise<User | null>;
  sendRecoverPasswordCode(email: string): Promise<void>;
  restorePassword(params: RestorePasswordParams): Promise<void>;
}
