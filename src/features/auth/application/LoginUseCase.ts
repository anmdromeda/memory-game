import { Result } from "../../../shared/domain/models/Result";
import type { UseCase } from "../../../shared/domain/models/UseCase";
import { UserValidationError } from "../domain/errors/UserErrors";
import { LoginCredentials, type LoginCredentialsProps } from "../domain/models/LoginCredentials";
import type { User } from "../domain/models/User";
import type { AuthService } from "../domain/services/AuthService";
import { executeWithErrorHandling } from "../../../shared/domain/utils/excecuteWithErrorHandling";

export type LoginInput = LoginCredentialsProps;
export type LoginOutput = Promise<Result<User | null>>;

export class LoginUseCase implements UseCase<LoginInput, LoginOutput> {
  constructor(private readonly authService: AuthService) {}

  async execute(input: LoginInput): LoginOutput {
    return executeWithErrorHandling(
      async () => {
        const credentialsVo = LoginCredentials.create(input);
        const authenticatedUser = await this.authService.login(credentialsVo);
        return Result.success(authenticatedUser);
      },
      (error: UserValidationError) => Result.failure({ error }),
    );
  }
}
