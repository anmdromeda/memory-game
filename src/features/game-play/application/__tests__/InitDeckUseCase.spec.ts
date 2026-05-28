import { beforeEach, describe, expect, it, vi } from "vitest";
import { Difficulty, GameDifficulty } from "../../domain/models/GameDifficulty";
import {
  CardContentType,
  MemoryCardCardState,
  type CardThemeProvider,
  type CardThemeProviderFactory,
  type MemoryCard,
  type ProviderTheme,
  type RawCard,
} from "../../domain/models/Card";
import { InitDeckUseCase, type InitDeckUseCaseInput } from "../InitDeckUseCase";
import { CardsGroupsListGenerator } from "../../domain/utils/groupListGenerator";
import { CardsValidator } from "../../domain/utils/cardsValidator";
import { CardsLengthMismatchError, CardValidationError } from "../../domain/errors/CardErrors";
import { InvalidResultValueAccessError } from "../../../../shared/domain/models/Result";
import { UnexpectedError } from "../../../../shared/domain/errors/AppErrors";

vi.mock("../../domain/utils/cardsValidator", () => {
  const CardsValidator = {
    ensureRawCardsLength: vi.fn(),
    ensureNonRepeated: vi.fn(),
    ensureMemoryCardsLength: vi.fn(),
  };

  return { CardsValidator };
});

vi.mock("../../domain/utils/groupListGenerator", () => ({
  CardsGroupsListGenerator: {
    generate: vi.fn().mockReturnValue([]),
  },
}));

vi.mock("../../../../shared/domain/utils/arrayShuffler", () => {
  const ArrayShuffler = {
    shuffle: vi.fn(),
  };

  return { ArrayShuffler };
});

const TestDifficulty = GameDifficulty.create({
  groupDifficulty: Difficulty.Easy,
  deckSizeDifficulty: Difficulty.Easy,
});

const rawCards: RawCard[] = [
  {
    id: "1-pair-1",
    content: "content-1",
    type: CardContentType.Image,
    title: "",
  },

  {
    id: "2-pair-1",
    content: "content-2",
    type: CardContentType.Image,
    title: "",
  },

  {
    id: "3-pair-1",
    content: "content-3",
    type: CardContentType.Image,
    title: "",
  },

  {
    id: "4-pair-1",
    content: "content-4",
    type: CardContentType.Image,
    title: "",
  },

  {
    id: "5-pair-1",
    content: "content-5",
    type: CardContentType.Image,
    title: "",
  },
];

const memoryCards: MemoryCard[][] = [
  [
    {
      id: "1-pair-1",
      content: "content-1",
      type: CardContentType.Image,
      groupId: "1",
      state: MemoryCardCardState.Idle,
      title: "",
    },

    {
      id: "1-pair-2",
      content: "content-1",
      type: CardContentType.Image,
      groupId: "1",
      state: MemoryCardCardState.Idle,
      title: "",
    },
  ],

  [
    {
      id: "2-pair-1",
      content: "content-2",
      type: CardContentType.Image,
      groupId: "2",
      state: MemoryCardCardState.Idle,
      title: "",
    },

    {
      id: "2-pair-2",
      content: "content-2",
      type: CardContentType.Image,
      groupId: "2",
      state: MemoryCardCardState.Idle,
      title: "",
    },
  ],

  [
    {
      id: "3-pair-1",
      content: "content-3",
      type: CardContentType.Image,
      groupId: "3",
      state: MemoryCardCardState.Idle,
      title: "",
    },

    {
      id: "3-pair-3",
      content: "content-3",
      type: CardContentType.Image,
      groupId: "3",
      state: MemoryCardCardState.Idle,
      title: "",
    },
  ],

  [
    {
      id: "4-pair-1",
      content: "content-4",
      type: CardContentType.Image,
      groupId: "4",
      state: MemoryCardCardState.Idle,
      title: "",
    },

    {
      id: "4-pair-4",
      content: "content-4",
      type: CardContentType.Image,
      groupId: "4",
      state: MemoryCardCardState.Idle,
      title: "",
    },
  ],

  [
    {
      id: "5-pair-1",
      content: "content-5",
      type: CardContentType.Image,
      groupId: "5",
      state: MemoryCardCardState.Idle,
      title: "",
    },

    {
      id: "5-pair-5",
      content: "content-5",
      type: CardContentType.Image,
      groupId: "5",
      state: MemoryCardCardState.Idle,
      title: "",
    },
  ],
];

describe("InitDeckUseCase - Unit Test", () => {
  let mockCardThemeProviderFactory: CardThemeProviderFactory;
  let mockCardThemeProvider: CardThemeProvider;
  let mockDifficulty: GameDifficulty;
  let useCase: InitDeckUseCase;

  beforeEach(() => {
    mockCardThemeProvider = {
      fetch: vi.fn().mockReturnValue(rawCards),
      theme: {} as ProviderTheme,
    };

    mockCardThemeProviderFactory = {
      getProvider: vi.fn().mockReturnValue(mockCardThemeProvider),
    };

    mockDifficulty = {
      getDeckSize: vi.fn().mockReturnValue(TestDifficulty.getDeckSize()),
      getMatchGroupSize: vi.fn().mockReturnValue(TestDifficulty.getMatchGroupSize()),
    } as unknown as GameDifficulty;

    useCase = new InitDeckUseCase(mockCardThemeProviderFactory);
  });

  it("should successfully initialize, validate, pair, shuffle, and return a shuffled deck", async () => {
    vi.mocked(CardsGroupsListGenerator.generate).mockReturnValue(memoryCards);

    const input: InitDeckUseCaseInput = {
      difficulty: mockDifficulty,
      theme: "THE_SIMPSONS",
    };

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);

    expect(mockCardThemeProviderFactory.getProvider).toHaveBeenCalledWith({ name: "THE_SIMPSONS" });
    expect(mockDifficulty.getDeckSize).toHaveBeenCalled();
    expect(mockCardThemeProvider.fetch).toHaveBeenCalled();

    expect(CardsValidator.ensureRawCardsLength).toHaveBeenCalled();

    expect(CardsValidator.ensureNonRepeated).toHaveBeenCalled();
    expect(CardsGroupsListGenerator.generate).toHaveBeenCalled();

    expect(CardsValidator.ensureMemoryCardsLength).toHaveBeenCalled();
  });

  it("should return a failure result with empty array when a CardValidationError is caught", async () => {
    vi.mocked(mockCardThemeProvider).fetch.mockReturnValue(Promise.resolve([]));

    vi.mocked(CardsValidator).ensureRawCardsLength.mockThrow(
      new CardsLengthMismatchError(TestDifficulty.getDeckSize(), 0),
    );

    const input: InitDeckUseCaseInput = {
      difficulty: mockDifficulty,
      theme: "POKE_API",
    };

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);

    try {
      result.getValue();
    } catch (error) {
      expect(error instanceof InvalidResultValueAccessError);
    }

    expect(result.getError()).toBeInstanceOf(CardValidationError);
  });

  it("should return a failure result with UnexpectedError when any other native error occurs", async () => {
    vi.mocked(mockCardThemeProvider).fetch.mockRejectedValue(new Error("Network Crash"));

    const input: InitDeckUseCaseInput = {
      difficulty: mockDifficulty,
      theme: "RICK_AND_MORTY",
    };

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(false);

    try {
      result.getValue();
    } catch (error) {
      expect(error instanceof InvalidResultValueAccessError);
    }

    expect(result.getError()).toBeInstanceOf(UnexpectedError);
  });
});
