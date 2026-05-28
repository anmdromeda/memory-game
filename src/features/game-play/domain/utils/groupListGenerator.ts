import { MemoryCardCardState, type MemoryCard, type MemoryCardGroupList, type RawCard } from "../models/Card";
import type { GameDifficulty } from "../models/GameDifficulty";

export class CardsGroupsListGenerator {
  static generate(params: { cards: RawCard[]; difficulty: GameDifficulty }): MemoryCardGroupList {
    const { difficulty, cards } = params;

    const deck: MemoryCardGroupList = [];

    for (const card of cards) {
      const groupId = card.id;
      const currentGroup: MemoryCard[] = [];

      for (let i = 0; i < difficulty.getMatchGroupSize(); i++) {
        const subCard: MemoryCard = {
          ...card,
          id: `${card.id}-${i}`,
          groupId,
          state: MemoryCardCardState.Idle,
        };

        currentGroup.push(subCard);
      }

      deck.push(currentGroup);
    }

    return deck;
  }
}
