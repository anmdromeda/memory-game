import { Result } from "../../../shared/domain/models/Result";
import type { UseCase } from "../../../shared/domain/models/UseCase";
import { executeWithErrorHandling } from "../../../shared/domain/utils/excecuteWithErrorHandling";
import { CardValidationError } from "../domain/errors/CardErrors";
import type { CardThemeProviderFactory, MemoryCard } from "../domain/models/Card";
import type { GameDifficulty } from "../domain/models/GameDifficulty";
import { CardsValidator } from "../domain/utils/cardsValidator";
import { CardsGroupsListGenerator } from "../domain/utils/groupListGenerator";

export type InitDeckUseCaseInput = {
  difficulty: GameDifficulty;
  theme: string;
};

export class InitDeckUseCase implements UseCase<InitDeckUseCaseInput, Promise<Result<MemoryCard[]>>> {
  constructor(private providerFactory: CardThemeProviderFactory) {}

  public async execute({ difficulty, theme }: InitDeckUseCaseInput) {
    return executeWithErrorHandling(
      async () => {
        const CardThemeProvider = this.providerFactory.getProvider({ name: theme });

        const cards = await CardThemeProvider.fetch({
          count: difficulty.getDeckSize(),
        });

        CardsValidator.ensureRawCardsLength({ difficulty, cards });
        CardsValidator.ensureNonRepeated({ cards });

        const groupList = CardsGroupsListGenerator.generate({ difficulty, cards });
        const flatPairs = groupList.flat();

        CardsValidator.ensureMemoryCardsLength({ cards: flatPairs, difficulty });

        return Result.success(flatPairs);
      },
      (error: CardValidationError) => {
        return Result.failure({
          error,
        });
      },
    );
  }
}
