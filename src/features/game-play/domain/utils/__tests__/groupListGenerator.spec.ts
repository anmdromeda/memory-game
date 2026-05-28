import { describe, expect, it, vi } from "vitest";
import type { GameDifficulty } from "../../models/GameDifficulty";
import { CardContentType, MemoryCardCardState, type RawCard } from "../../models/Card";
import { CardsGroupsListGenerator } from "../groupListGenerator";

const createMockDifficulty = (matchGroupSize: number) =>
  ({
    getMatchGroupSize: vi.fn().mockReturnValue(matchGroupSize),
  }) as unknown as GameDifficulty;

describe("CardsGroupsListGenerator", () => {
  it("should generate the exact number of sub-cards per group dictated by the difficulty", () => {
    const difficulty = createMockDifficulty(3);
    const rawCards: RawCard[] = [
      {
        id: "lion",
        content: "Lion Image",
        type: CardContentType.Image,
        title: "",
      },
    ];

    const result = CardsGroupsListGenerator.generate({ cards: rawCards, difficulty });

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(3);
  });

  it("should correctly format card IDs, group IDs, and enforce the initial Idle state", () => {
    const difficulty = createMockDifficulty(2);
    const rawCards: RawCard[] = [
      {
        id: "card-a",
        content: "A",
        type: CardContentType.Image,
        title: "",
      },
    ];

    const result = CardsGroupsListGenerator.generate({ cards: rawCards, difficulty });
    const generatedGroup = result[0];

    expect(generatedGroup[0].id).toBe("card-a-0");
    expect(generatedGroup[0].groupId).toBe("card-a");
    expect(generatedGroup[0].state).toBe(MemoryCardCardState.Idle);

    expect(generatedGroup[1].id).toBe("card-a-1");
    expect(generatedGroup[1].groupId).toBe("card-a");
    expect(generatedGroup[1].state).toBe(MemoryCardCardState.Idle);
  });

  it("should preserve all original raw card data properties through object spreading", () => {
    const difficulty = createMockDifficulty(2);
    const rawCards: RawCard[] = [
      {
        id: "safari-1",
        content: "Giraffe",
        type: CardContentType.Image,
        title: "",
      },
    ];

    const result = CardsGroupsListGenerator.generate({ cards: rawCards, difficulty });
    const sampleCard = result[0][0];

    expect(sampleCard.content).toBe("Giraffe");
    expect(sampleCard.type).toBe(CardContentType.Image);
  });

  it("should return an empty deck array when provided with an empty list of raw cards", () => {
    const difficulty = createMockDifficulty(2);
    const rawCards: RawCard[] = [];

    const result = CardsGroupsListGenerator.generate({ cards: rawCards, difficulty });

    expect(result).toEqual([]);
  });
});
