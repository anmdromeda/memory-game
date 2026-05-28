import { Result } from "../../../shared/domain/models/Result";
import type { UseCase } from "../../../shared/domain/models/UseCase";
import { executeWithErrorHandling } from "../../../shared/domain/utils/excecuteWithErrorHandling";
import { UserValidationError } from "../domain/errors/UserErrors";
import { RegistrationUserData, type RegistrationUserDataProps } from "../domain/models/RegistrationUserData";
import type { User } from "../domain/models/User";
import type { AuthService } from "../domain/services/AuthService";

export type RegisterInput = RegistrationUserDataProps;

export type RegisterOutput = Promise<Result<User | null>>;

export class RegisterUseCase implements UseCase<RegisterInput, RegisterOutput> {
  constructor(private readonly authService: AuthService) {}

  async execute(input: RegisterInput): RegisterOutput {
    return executeWithErrorHandling(
      async () => {
        const registerDataVo = RegistrationUserData.create(input);
        const registeredUser = await this.authService.register(registerDataVo);

        return Result.success(registeredUser);
      },
      (error: UserValidationError) => Result.failure({ error }),
    );
  }
}
