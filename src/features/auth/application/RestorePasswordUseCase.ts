import { UnexpectedError } from "../../../shared/domain/errors/AppErrors";
import { Result } from "../../../shared/domain/models/Result";
import type { UseCase } from "../../../shared/domain/models/UseCase";
import { executeWithErrorHandling } from "../../../shared/domain/utils/excecuteWithErrorHandling";
import { RuleBasedValidator } from "../../../shared/domain/utils/ruleBasedValidator";
import { UserValidationError } from "../domain/errors/UserErrors";
import type { AuthService, RestorePasswordParams } from "../domain/services/AuthService";
import { PasswordValidator } from "../domain/utils/passwordValidator";

export type RestorePasswordInput = RestorePasswordParams;
export type RestorePasswordOutput = Promise<Result<void>>;

export class RestorePasswordUseCase implements UseCase<RestorePasswordInput, RestorePasswordOutput> {
  constructor(private readonly authService: AuthService) {}

  async execute(input: RestorePasswordInput): RestorePasswordOutput {
    return executeWithErrorHandling(
      async () => {
        if (!input.token.trim()) {
          throw new UnexpectedError();
        }

        RuleBasedValidator.validateThrowable(input, PasswordValidator.rules);

        await this.authService.restorePassword(input);

        return Result.success(undefined);
      },
      (error: UserValidationError) => Result.failure({ error }),
    );
  }
}
