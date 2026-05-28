import { AppError, UnexpectedError } from "../../../../shared/domain/errors/AppErrors";
import { delay } from "../../../../shared/domain/utils/delay";
import { AuthErrorCode, UserNotFoundError } from "../../domain/errors/UserErrors";
import type { LoginCredentials } from "../../domain/models/LoginCredentials";
import type { RegistrationUserData } from "../../domain/models/RegistrationUserData";
import type { User } from "../../domain/models/User";
import type { UserRepository } from "../../domain/repository/UserRepository";
import type { AuthService, RestorePasswordParams } from "../../domain/services/AuthService";
import { BcryptCryptoEngine } from "../utils/byCryptEngine";

export class InvalidCredentialsError extends AppError {
  constructor() {
    super({
      message: "The email or password provided is incorrect.",
      code: AuthErrorCode.INVALID_CREDENTIALS,
    });
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super({
      message: "The authentication token has expired.",
      code: AuthErrorCode.TOKEN_EXPIRED,
    });
  }
}

const SESSION_EXPIRE_TIME_MIN = 60;

export class AppAuthService implements AuthService {
  private readonly cryptoEngine = new BcryptCryptoEngine();
  private localStorageUserTokenKey = "auth_token";
  private localStorageUserTokenExpireTimeKey = "auth_token_expire_time";
  private localStorageEmailsTokenMapKey = "auth_emails_token_map";
  private emailsTokenMap: Record<string, string> = JSON.parse(
    localStorage.getItem(this.localStorageEmailsTokenMapKey) || "{}",
  );

  constructor(private readonly userRepository: UserRepository) {}

  public async getUser(): Promise<User | null> {
    await delay(1000);

    this.ensureTokenAvailable();

    return await this.userRepository.findById(this.getUserIdFromToken());
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const userEntity = await this.userRepository.findByUsername(credentials.username);

    if (!userEntity) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.cryptoEngine.compare(credentials.password, userEntity.passwordHash);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const publicUser: User = {
      id: userEntity.id,
      email: userEntity.email,
      username: userEntity.username,
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
      createdAt: userEntity.createdAt,
    };

    const authCredentials = await this.generateToken(publicUser.id);

    this.saveAuthCredentials(authCredentials);

    return publicUser;
  }

  async register(userData: RegistrationUserData): Promise<User> {
    const newUser = await this.userRepository.create({
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password,
    });

    const authCredentials = await this.generateToken(newUser.id);

    this.saveAuthCredentials(authCredentials);

    return newUser;
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem(this.localStorageUserTokenKey);
      localStorage.removeItem(this.localStorageUserTokenExpireTimeKey);
      return Promise.resolve();
    } catch {
      throw new AppError({
        message: "Failed to cleanly terminate the user session.",
        code: AuthErrorCode.SESSION_ERROR,
      });
    }
  }

  private logEmailAndResetLink(email: string, url: string) {
    alert(`Un correo electrónico ha sido enviado a ${email}. Por favor, revise la consola para más detalles.`);

    console.log(
      `%cEnlace:%c\n${url}`,
      "color: #d98e72; font-weight: bold; font-size: 14px; margin-top: 10px;",
      "color: #ffffff; font-family: monospace; font-size: 13px; line-height: 2;",
    );
  }

  async sendRecoverPasswordCode(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundError(email);
    }

    await delay(1000);

    const token = String(new Date().getTime());
    const url = `${location.host}/restore-password?token=${token}`;

    Object.entries(this.emailsTokenMap).forEach(([token, savedEmail]) => {
      if (email === savedEmail) {
        delete this.emailsTokenMap[token];
      }
    });

    this.emailsTokenMap[token] = email;

    localStorage.setItem(this.localStorageEmailsTokenMapKey, JSON.stringify(this.emailsTokenMap));

    this.logEmailAndResetLink(email, url);
  }

  async restorePassword(params: RestorePasswordParams): Promise<void> {
    await delay(1000);

    const userEmail = this.emailsTokenMap[params.token];

    if (!userEmail) {
      throw new UnexpectedError();
    }

    const user = await this.userRepository.findByEmail(userEmail);

    if (!user) {
      throw new UserNotFoundError(userEmail);
    }

    await this.userRepository.updatePassword(user.id, params.password);

    delete this.emailsTokenMap[params.token];

    localStorage.setItem(this.localStorageEmailsTokenMapKey, JSON.stringify(this.emailsTokenMap));
  }

  private getUserIdFromToken() {
    const token = localStorage.getItem(this.localStorageUserTokenKey) as string;
    const [, userId] = token.split("|");

    return userId;
  }

  private saveAuthCredentials(data: { token: string; expireTime: number }) {
    localStorage.setItem(this.localStorageUserTokenKey, data.token);
    localStorage.setItem(this.localStorageUserTokenExpireTimeKey, String(data.expireTime));
  }

  private throwTokenExpiredError() {
    localStorage.removeItem(this.localStorageUserTokenExpireTimeKey);
    localStorage.removeItem(this.localStorageUserTokenKey);
    throw new TokenExpiredError();
  }

  private ensureTokenAvailable() {
    const token = localStorage.getItem(this.localStorageUserTokenKey);

    if (!token) {
      this.throwTokenExpiredError();
    }

    const expireTime = localStorage.getItem(this.localStorageUserTokenExpireTimeKey);

    if (!expireTime) {
      this.throwTokenExpiredError();
    }

    const now = Date.now();
    const limitInMilliseconds = SESSION_EXPIRE_TIME_MIN * 60 * 1000;

    const hasTimePassed = now - Number(expireTime) >= limitInMilliseconds;

    if (hasTimePassed) {
      this.throwTokenExpiredError();
    }
  }

  private async generateToken(userId: string): Promise<{ token: string; expireTime: number }> {
    const timestamp = Date.now();
    const mockJwt = await this.cryptoEngine.hash(String(timestamp));

    return {
      token: `${mockJwt}|${userId}`,
      expireTime: timestamp,
    };
  }
}
