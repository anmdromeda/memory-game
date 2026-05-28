import { AppError } from "../../../../shared/domain/errors/AppErrors";
import type { RawCard } from "../models/Card";

export const CardsErrorCode = {
  INVALID_LENGTH: "CARDS_INVALID_LENGTH",
  DUPLICATED_CARD: "CARDS_DUPLICATED_CARD",
  INVALID_CARDS_MODULO: "CARDS_INVALID_CARDS_MODULO",
  SAME_CARD_SELECTION: "CARDS_SAME_CARD_SELECTION",
  MISSING_CARD_SELECTION: "CARDS_MISSING_CARD_SELECTION",
  CARDS_PROVIDER_NOT_FOUND: "CARDS_PROVIDER_NOT_FOUND",
  DECK_CARD_ALREADY_MATCHED: "DECK_CARD_ALREADY_MATCHED",
} as const;

export type CardsErrorCodeType = (typeof CardsErrorCode)[keyof typeof CardsErrorCode];

export class CardValidationError extends AppError {
  constructor(params: { message: string; code: CardsErrorCodeType }) {
    super(params);
  }
}

export class CardsLengthMismatchError extends CardValidationError {
  constructor(expected: number, actual: number) {
    super({
      message: `The number of cards provided (${actual}) does not match the required number for the selected difficulty (${expected}).`,
      code: CardsErrorCode.INVALID_LENGTH,
    });
  }
}

export class DuplicatedCardError extends CardValidationError {
  constructor(card: RawCard) {
    super({
      message: `A duplicated card was detected in the set: ID [${card.id}] - Type [${card.type}].`,
      code: CardsErrorCode.DUPLICATED_CARD,
    });
  }
}

export class InvalidCardsModuloError extends AppError {
  constructor(actualLength: number, groupSize: number) {
    super({
      message: `The total number of cards (${actualLength}) is not a valid multiple for groups of ${groupSize}.`,
      code: CardsErrorCode.INVALID_CARDS_MODULO,
    });
  }
}

export class SameCardSelectionError extends CardValidationError {
  constructor(cardId: string) {
    super({
      message: `You cannot select the same card twice to form a pair. Card ID: [${cardId}].`,
      code: CardsErrorCode.SAME_CARD_SELECTION,
    });
  }
}

export class MissingCardSelectionError extends CardValidationError {
  constructor() {
    super({
      message: `The operation requires that a group of valid cards be selected, but one or all are missing.`,
      code: CardsErrorCode.MISSING_CARD_SELECTION,
    });
  }
}

export class CardThemeProviderNotFoundError extends AppError {
  constructor(invalidProviderName: string, allowedProviders: string[]) {
    super({
      message: `Cards provider "${invalidProviderName}" is not supported. The available providers are: [${allowedProviders.join(", ")}].`,
      code: CardsErrorCode.CARDS_PROVIDER_NOT_FOUND,
    });
  }
}

export class CardAlreadyMatchedError extends AppError {
  constructor(cardId?: string) {
    const message = cardId
      ? `You cannot interact with the card "${cardId}" because it has already been matched.`
      : "You cannot perform this action because one or more selected cards have already been matched.";

    super({
      message,
      code: CardsErrorCode.DECK_CARD_ALREADY_MATCHED,
    });
  }
}
