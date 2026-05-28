import {
  CardAlreadyMatchedError,
  CardsLengthMismatchError,
  DuplicatedCardError,
  InvalidCardsModuloError,
  MissingCardSelectionError,
  SameCardSelectionError,
} from "../errors/CardErrors";
import { MemoryCardCardState, type MemoryCard, type RawCard } from "../models/Card";
import type { GameDifficulty } from "../models/GameDifficulty";

export class CardsValidator {
  static ensureRawCardsLength(params: { difficulty: GameDifficulty; cards: RawCard[] }) {
    const expectedLength = params.difficulty.getDeckSize();
    const actualLength = params.cards.length;

    if (actualLength !== expectedLength) {
      throw new CardsLengthMismatchError(expectedLength, actualLength);
    }
  }

  static ensureNonRepeated(params: { cards: RawCard[] }) {
    const seenObjects = new Set<string>();

    for (const card of params.cards) {
      const cleanCard: RawCard = {
        id: card.id,
        content: card.content.trim(),
        type: card.type,
        title: card.title,
      };

      const serializedCard = JSON.stringify(cleanCard);

      if (seenObjects.has(serializedCard)) {
        throw new DuplicatedCardError(cleanCard);
      }

      seenObjects.add(serializedCard);
    }

    return true;
  }

  static ensureMemoryCardsLength(params: { cards: MemoryCard[]; difficulty: GameDifficulty }) {
    const actualLength = params.cards.length;
    const groupSize = params.difficulty.getMatchGroupSize();

    if (actualLength % groupSize !== 0) {
      throw new InvalidCardsModuloError(actualLength, groupSize);
    }
  }

  static isSameCards(params: { cards: MemoryCard[] }): boolean {
    const ids = params.cards.map((card) => card.id);
    return new Set(ids).size !== params.cards.length;
  }

  static ensureAreNotSameCards(params: { cards: MemoryCard[] }) {
    if (CardsValidator.isSameCards(params)) {
      throw new SameCardSelectionError(params.cards[0].id);
    }
  }

  static hasSameGroupId(params: { cards: MemoryCard[] }): boolean {
    if (CardsValidator.isSameCards(params)) {
      return false;
    }

    if (params.cards.length === 0) {
      return false;
    }

    const firstGroupId = params.cards[0].groupId;

    return params.cards.every((card) => card.groupId === firstGroupId);
  }

  static ensureNonEmptyRequest(params: { cards: Array<MemoryCard> }) {
    if (!params.cards.length) {
      throw new MissingCardSelectionError();
    }
  }

  static isSelectableCard(card: MemoryCard): boolean {
    return card.state === MemoryCardCardState.Idle;
  }

  static ensurAreNotMatchedCards(params: { cards: Array<MemoryCard> }) {
    const hasMatchedCard = params.cards.some((card) => card.state === MemoryCardCardState.Matched);

    if (hasMatchedCard) {
      throw new CardAlreadyMatchedError();
    }
  }
}
