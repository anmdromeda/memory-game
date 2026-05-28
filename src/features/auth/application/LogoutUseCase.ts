import { Result } from "../../../shared/domain/models/Result";
import type { UseCase } from "../../../shared/domain/models/UseCase";
import { executeWithErrorHandling } from "../../../shared/domain/utils/excecuteWithErrorHandling";
import type { AuthService } from "../domain/services/AuthService";

type LogoutUseCaseResult = Result<{ isLoggedOut: boolean }>;

export class LogoutUseCase implements UseCase<void, Promise<LogoutUseCaseResult>> {
  constructor(private readonly authService: AuthService) {}

  async execute(): Promise<LogoutUseCaseResult> {
    return executeWithErrorHandling(
      async () => {
        await this.authService.logout();
        return Result.success({ isLoggedOut: true });
      },
      (error) => Result.failure({ error }),
    );
  }
}
