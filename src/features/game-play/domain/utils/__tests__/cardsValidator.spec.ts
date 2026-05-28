import { describe, expect, it, vi } from "vitest";
import type { GameDifficulty } from "../../models/GameDifficulty";
import { CardsValidator } from "../cardsValidator";
import {
  CardAlreadyMatchedError,
  CardsLengthMismatchError,
  DuplicatedCardError,
  InvalidCardsModuloError,
  MissingCardSelectionError,
  SameCardSelectionError,
} from "../../errors/CardErrors";
import { CardContentType, MemoryCardCardState, type MemoryCard, type RawCard } from "../../models/Card";

const createMockDifficulty = (deckSize: number, matchGroupSize: number) =>
  ({
    getDeckSize: vi.fn().mockReturnValue(deckSize),
    getMatchGroupSize: vi.fn().mockReturnValue(matchGroupSize),
  }) as unknown as GameDifficulty;

describe("CardsValidator", () => {
  describe("ensureRawCardsLength", () => {
    it("should pass silently when the cards length matches the expected difficulty size", () => {
      const difficulty = createMockDifficulty(10, 2);
      const cards = Array(10).fill({});

      expect(() => {
        CardsValidator.ensureRawCardsLength({ difficulty, cards });
      }).not.toThrow();
    });

    it("should throw CardsLengthMismatchError when the cards length differs from expected", () => {
      const difficulty = createMockDifficulty(10, 2);
      const cards = Array(8).fill({});

      expect(() => {
        CardsValidator.ensureRawCardsLength({ difficulty, cards });
      }).toThrow(CardsLengthMismatchError);
    });
  });

  describe("ensureNonRepeated", () => {
    it("should return true when all cards are unique after trimming whitespace", () => {
      const cards: Array<RawCard> = [
        {
          id: "1",
          content: " dog ",
          type: CardContentType.Text,
          title: "",
        },
        {
          id: "2",
          content: "dog",
          type: CardContentType.Image,
          title: "",
        },
      ];

      expect(CardsValidator.ensureNonRepeated({ cards })).toBe(true);
    });

    it("should throw DuplicatedCardError when a duplicate normalized card is detected", () => {
      const cards: Array<RawCard> = [
        {
          id: "1",
          content: "cat",
          type: CardContentType.Text,
          title: "",
        },
        {
          id: "1",
          content: "  cat  ",
          type: CardContentType.Text,
          title: "",
        },
      ];

      expect(() => {
        CardsValidator.ensureNonRepeated({ cards });
      }).toThrow(DuplicatedCardError);
    });
  });

  describe("ensureMemoryCardsLength", () => {
    it("should pass silently when the card count is an exact multiple of the match group size", () => {
      const difficulty = createMockDifficulty(12, 3); 
      const cards: Array<MemoryCard> = Array(9).fill({});

      expect(() => {
        CardsValidator.ensureMemoryCardsLength({ cards, difficulty });
      }).not.toThrow();
    });

    it("should throw InvalidCardsModuloError when the card count cannot evenly form complete groups", () => {
      const difficulty = createMockDifficulty(12, 2);
      const cards = Array(7).fill({});

      expect(() => {
        CardsValidator.ensureMemoryCardsLength({ cards, difficulty });
      }).toThrow(InvalidCardsModuloError);
    });
  });

  describe("isSameCards and ensureAreNotSameCards", () => {
    it("should correctly detect if the exact same physical card instance is passed", () => {
      const cards = [{ id: "A" }, { id: "A" }] as MemoryCard[];

      expect(CardsValidator.isSameCards({ cards })).toBe(true);
      expect(() => CardsValidator.ensureAreNotSameCards({ cards })).toThrow(SameCardSelectionError);
    });

    it("should pass silently when all card IDs are completely unique", () => {
      const cards = [{ id: "A" }, { id: "B" }] as MemoryCard[];

      expect(CardsValidator.isSameCards({ cards })).toBe(false);
      expect(() => CardsValidator.ensureAreNotSameCards({ cards })).not.toThrow();
    });
  });

  describe("hasSameGroupId", () => {
    it("should return true when all cards belong to the same family group", () => {
      const cards = [
        { id: "1", groupId: "lion-family" },
        { id: "2", groupId: "lion-family" },
      ] as MemoryCard[];

      expect(CardsValidator.hasSameGroupId({ cards })).toBe(true);
    });

    it("should return false when at least one card belongs to a different family group", () => {
      const cards = [
        { id: "1", groupId: "lion-family" },
        { id: "2", groupId: "giraffe-family" },
      ] as MemoryCard[];

      expect(CardsValidator.hasSameGroupId({ cards })).toBe(false);
    });

    it("should return false when trying to pass the exact same physical card twice", () => {
      const cards = [
        { id: "1", groupId: "lion-family" },
        { id: "1", groupId: "lion-family" },
      ] as MemoryCard[];

      expect(CardsValidator.hasSameGroupId({ cards })).toBe(false);
    });
  });

  describe("ensureNonEmptyRequest", () => {
    it("should pass silently when the card array contains elements", () => {
      expect(() => CardsValidator.ensureNonEmptyRequest({ cards: [{}] as MemoryCard[] })).not.toThrow();
    });

    it("should throw MissingCardSelectionError when the card array is empty", () => {
      expect(() => CardsValidator.ensureNonEmptyRequest({ cards: [] })).toThrow(MissingCardSelectionError);
    });
  });

  describe("isSelectableCard and ensurAreNotMatchedCards", () => {
    it("should allow selection when the card state is Idle", () => {
      const card: MemoryCard = {
        state: MemoryCardCardState.Idle,
        groupId: "",
        id: "",
        content: "",
        type: CardContentType.Color,
        title: "",
      };

      expect(CardsValidator.isSelectableCard(card)).toBe(true);
    });

    it("should reject selection when at least one card is already Matched", () => {
      const card: MemoryCard = {
        groupId: "",
        id: "",
        content: "",
        type: CardContentType.Color,
        state: MemoryCardCardState.Matched,
        title: "",
      };

      expect(CardsValidator.isSelectableCard(card)).toBe(false);
      expect(() => {
        CardsValidator.ensurAreNotMatchedCards({ cards: [card] });
      }).toThrow(CardAlreadyMatchedError);
    });
  });
});
