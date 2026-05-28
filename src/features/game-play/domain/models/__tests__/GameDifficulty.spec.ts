import { describe, it, expect } from "vitest";
import { InvalidArgumentError } from "../../../../../shared/domain/errors/AppErrors";
import { Difficulty, GameDifficulty } from "../GameDifficulty";

describe("GameDifficulty (Value Object)", () => {
  describe("Creation & Validation (Sad Paths)", () => {
    it("should throw InvalidArgumentError if groupDifficulty is not a valid enum value", () => {
      expect(() => {
        GameDifficulty.create({
          groupDifficulty: "SUPER_HARD" as Difficulty,
          deckSizeDifficulty: Difficulty.Easy,
        });
      }).toThrow(InvalidArgumentError);
    });

    it("should throw InvalidArgumentError if deckSizeDifficulty is not a valid enum value", () => {
      expect(() => {
        GameDifficulty.create({
          groupDifficulty: Difficulty.Easy,
          deckSizeDifficulty: "INVALID_SIZE" as Difficulty,
        });
      }).toThrow(InvalidArgumentError);
    });
  });

  describe("Domain Computations (Happy Paths)", () => {
    it("should correctly initialize and expose immutable property values", () => {
      const difficulty = GameDifficulty.create({
        groupDifficulty: Difficulty.Easy,
        deckSizeDifficulty: Difficulty.Medium,
      });

      expect(Object.isFrozen(difficulty)).toBe(true);
    });

    it("should calculate the correct match group size based on groupDifficulty mapping", () => {
      const easyGroup = GameDifficulty.create({
        groupDifficulty: Difficulty.Easy,
        deckSizeDifficulty: Difficulty.Easy,
      });
      const mediumGroup = GameDifficulty.create({
        groupDifficulty: Difficulty.Medium,
        deckSizeDifficulty: Difficulty.Easy,
      });
      const hardGroup = GameDifficulty.create({
        groupDifficulty: Difficulty.Hard,
        deckSizeDifficulty: Difficulty.Easy,
      });

      expect(easyGroup.getMatchGroupSize()).toBe(2);
      expect(mediumGroup.getMatchGroupSize()).toBe(3);
      expect(hardGroup.getMatchGroupSize()).toBe(4);
    });

    it("should calculate the correct deck size based on deckSizeDifficulty mapping", () => {
      const easyDeck = GameDifficulty.create({ groupDifficulty: Difficulty.Easy, deckSizeDifficulty: Difficulty.Easy });
      const mediumDeck = GameDifficulty.create({
        groupDifficulty: Difficulty.Easy,
        deckSizeDifficulty: Difficulty.Medium,
      });
      const hardDeck = GameDifficulty.create({ groupDifficulty: Difficulty.Easy, deckSizeDifficulty: Difficulty.Hard });

      expect(easyDeck.getDeckSize()).toBe(6);
      expect(mediumDeck.getDeckSize()).toBe(12);
      expect(hardDeck.getDeckSize()).toBe(18);
    });

    it("should compute total matches mathematically (DeckSize * GroupSize / GroupSize)", () => {
      const dynamicDifficulty = GameDifficulty.create({
        groupDifficulty: Difficulty.Easy,
        deckSizeDifficulty: Difficulty.Hard,
      });

      expect(dynamicDifficulty.getTotalMatches()).toBe(18);
    });
  });
});
