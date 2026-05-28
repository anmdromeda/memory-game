import { Result } from "../../../shared/domain/models/Result";
import type { UseCase } from "../../../shared/domain/models/UseCase";
import { executeWithErrorHandling } from "../../../shared/domain/utils/excecuteWithErrorHandling";
import type { AuthService } from "../domain/services/AuthService";
import { EmailValidator } from "../domain/utils/emailValidator";

export type SendRecoverPasswordCodeInput = { email: string };

export class SendRecoverPasswordCodeUseCase implements UseCase<SendRecoverPasswordCodeInput, Promise<Result<void>>> {
  constructor(private readonly authService: AuthService) {}

  async execute({ email }: SendRecoverPasswordCodeInput) {
    return executeWithErrorHandling(
      async () => {
        EmailValidator.ensureNotEmpty(email);
        EmailValidator.ensureIsValidFormat(email);
        await this.authService.sendRecoverPasswordCode(email);
        return Result.success(undefined);
      },
      (error) => Result.failure({ error }),
    );
  }
}
