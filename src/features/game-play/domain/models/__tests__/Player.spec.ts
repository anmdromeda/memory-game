import { describe, it, expect } from "vitest";
import { InvalidPlayerProgressError } from "../../errors/GameSessionErrors";
import { PlayerProgress } from "../Player";

describe("PlayerProgress (Value Object)", () => {
  describe("Initialization Factories", () => {
    it("should create a fresh progress instance with all metrics set to zero", () => {
      const progress = PlayerProgress.create();

      expect(progress.score).toBe(0);
      expect(progress.moves).toBe(0);
      expect(progress.misses).toBe(0);
    });

    it("should hydrate an instance accurately from raw properties using fromRaw", () => {
      const raw = { score: 2, moves: 5, misses: 3 };
      const progress = PlayerProgress.fromRaw(raw);

      expect(progress.score).toBe(2);
      expect(progress.moves).toBe(5);
      expect(progress.misses).toBe(3);
    });
  });

  describe("Domain Invariant Validations (Sad Paths)", () => {
    it("should throw InvalidPlayerProgressError if any metric is a negative number", () => {
      expect(() => {
        PlayerProgress.fromRaw({ score: -1, moves: 0, misses: 0 });
      }).toThrow(InvalidPlayerProgressError);

      expect(() => {
        PlayerProgress.fromRaw({ score: 0, moves: -5, misses: 0 });
      }).toThrow(InvalidPlayerProgressError);

      expect(() => {
        PlayerProgress.fromRaw({ score: 0, moves: 0, misses: -2 });
      }).toThrow(InvalidPlayerProgressError);
    });

    it("should throw InvalidPlayerProgressError if the sum of scores and misses exceeds total moves", () => {
      expect(() => {
        PlayerProgress.fromRaw({ score: 3, moves: 3, misses: 1 });
      }).toThrow(InvalidPlayerProgressError);
    });
  });

  describe("Immutable Mutations & Behavior (Happy Paths)", () => {
    it("should return a new instance with incremented score and moves upon a match win", () => {
      const initialProgress = PlayerProgress.create();

      const updatedProgress = initialProgress.incrementMatch();

      expect(updatedProgress.score).toBe(1);
      expect(updatedProgress.moves).toBe(1);
      expect(updatedProgress.misses).toBe(0);

      expect(initialProgress.score).toBe(0);
      expect(initialProgress.moves).toBe(0);
    });

    it("should return a new instance with incremented misses and moves upon a miss turn", () => {
      const initialProgress = PlayerProgress.create();

      const updatedProgress = initialProgress.incrementMiss();

      expect(updatedProgress.score).toBe(0);
      expect(updatedProgress.moves).toBe(1);
      expect(updatedProgress.misses).toBe(1);

      expect(initialProgress.misses).toBe(0);
    });

    it("should correctly evaluate structural equality using equals method", () => {
      const progressA = PlayerProgress.fromRaw({ score: 2, moves: 4, misses: 2 });
      const progressB = PlayerProgress.fromRaw({ score: 2, moves: 4, misses: 2 });
      const progressC = PlayerProgress.fromRaw({ score: 1, moves: 4, misses: 3 });

      expect(progressA.equals(progressB)).toBe(true);
      expect(progressA.equals(progressC)).toBe(false);
      expect(progressA.equals({} as PlayerProgress)).toBe(false);
    });

    it("should export a plain raw data snapshot slice using toRaw", () => {
      const rawFixture = { score: 4, moves: 10, misses: 6 };
      const progress = PlayerProgress.fromRaw(rawFixture);

      const result = progress.toRaw();

      expect(result).toEqual(rawFixture);
      expect(result).not.toBe(rawFixture);
    });
  });
});
