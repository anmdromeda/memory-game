import { Result } from "../../../shared/domain/models/Result";
import type { UseCase } from "../../../shared/domain/models/UseCase";
import { executeWithErrorHandling } from "../../../shared/domain/utils/excecuteWithErrorHandling";
import type { UserValidationError } from "../domain/errors/UserErrors";
import type { User } from "../domain/models/User";
import type { AuthService } from "../domain/services/AuthService";

export class RetrieveUserInfoUseCase implements UseCase<void, Promise<Result<User | null>>> {
  constructor(private readonly authService: AuthService) {}

  async execute(): Promise<Result<User | null>> {
    return executeWithErrorHandling(
      async () => {
        const userInfo = await this.authService.getUser();
        return Result.success(userInfo);
      },
      (error: UserValidationError) => Result.failure({ error }),
    );
  }
}
