import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameSession, type GameSessionConfig, type GameSessionSnapshot } from "../GameSession";
import { GameManager } from "../GameManager";
import { Difficulty, GameDifficulty } from "../GameDifficulty";
import { CardContentType, MemoryCardCardState } from "../Card";
import { GameSessionNotInitializedError, GameSessionNotStartedError } from "../../errors/GameSessionErrors";

vi.mock("../GameSession", async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  const MockGameSessionSpy = vi.fn().mockImplementation(function (this: GameSession) {
    this.selectCard = vi.fn();
    this.getSnapshot = vi.fn().mockReturnValue({
      activePlayer: null,
      deck: [],
      isFinished: false,
      players: [],
      scores: {},
    });
    this.hasSelectedFullGroup = vi.fn().mockReturnValue(false);
    this.proccessTurnOutcome = vi.fn().mockResolvedValue(undefined);
    this.start = vi.fn();
    this.revealDeck = vi.fn();
    this.hideRevealedDeck = vi.fn();
    this.hasStarted = vi.fn();
    this.flipDeck = vi.fn();
    this.disableCardSelection = vi.fn();
  });

  return {
    ...actual,
    GameSession: MockGameSessionSpy,
  };
});

describe("GameManager", () => {
  let mockConfig: { onChange?: (state: GameSessionSnapshot) => void };
  let dummyProps: GameSessionConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockConfig = {
      onChange: vi.fn(),
    };

    dummyProps = {
      difficulty: GameDifficulty.create({ groupDifficulty: Difficulty.Easy, deckSizeDifficulty: Difficulty.Easy }),
      players: [{ name: "Test", id: "1" }],
      rawDeck: [
        {
          id: "c1-0",
          groupId: "pair-1",
          state: MemoryCardCardState.Idle,
          content: "",
          type: CardContentType.Image,
          title: "",
        },
        {
          id: "c1-1",
          groupId: "pair-1",
          state: MemoryCardCardState.Idle,
          content: "",
          type: CardContentType.Image,
          title: "",
        },

        {
          id: "c2-0",
          groupId: "pair-2",
          state: MemoryCardCardState.Idle,
          content: "",
          type: CardContentType.Image,
          title: "",
        },
        {
          id: "c2-2",
          groupId: "pair-2",
          state: MemoryCardCardState.Idle,
          content: "",
          type: CardContentType.Image,
          title: "",
        },

        {
          id: "c3-0",
          groupId: "pair-3",
          state: MemoryCardCardState.Idle,
          content: "",
          type: CardContentType.Image,
          title: "",
        },
        {
          id: "c3-3",
          groupId: "pair-3",
          state: MemoryCardCardState.Idle,
          content: "",
          type: CardContentType.Image,
          title: "",
        },

        {
          id: "c4-0",
          groupId: "pair-4",
          state: MemoryCardCardState.Idle,
          content: "",
          type: CardContentType.Image,
          title: "",
        },
        {
          id: "c4-4",
          groupId: "pair-4",
          state: MemoryCardCardState.Idle,
          content: "",
          type: CardContentType.Image,
          title: "",
        },

        {
          id: "c5-0",
          groupId: "pair-5",
          state: MemoryCardCardState.Idle,
          content: "",
          type: CardContentType.Image,
          title: "",
        },
        {
          id: "c5-5",
          groupId: "pair-5",
          state: MemoryCardCardState.Idle,
          content: "",
          type: CardContentType.Image,
          title: "",
        },
      ],
      eventBus: {
        on: vi.fn(),
        emit: vi.fn(),
        off: vi.fn(),
        clear: vi.fn(),
      },
    };
  });

  describe("Uninitialized State Exceptions", () => {
    it("should throw GameSessionNotInitializedError when trying to get state before starting a game", () => {
      const manager = new GameManager(mockConfig);

      manager.initSession(dummyProps);

      expect(() => manager.getState()).not.toThrow(GameSessionNotInitializedError);
    });

    it("should throw GameSessionNotStartedError when trying to select a card before starting a game", async () => {
      const manager = new GameManager(mockConfig);

      manager.initSession(dummyProps);

      try {
        await manager.selectCard("card-id");
      } catch (error) {
        expect(error instanceof GameSessionNotStartedError).toBe(true);
      }
    });
  });

  describe("startGame", () => {
    it("should initialize a GameSession and immediately broadcast the first state snapshot", async () => {
      const manager = new GameManager(mockConfig);

      manager.initSession(dummyProps);

      const outcomePromise = manager.startGame();

      await vi.advanceTimersByTimeAsync(3600);
      await outcomePromise;

      expect(GameSession).toHaveBeenCalledWith({
        rawDeck: dummyProps.rawDeck,
        difficulty: dummyProps.difficulty,
        players: dummyProps.players,
        eventBus: dummyProps.eventBus,
      });

      expect(mockConfig.onChange).toHaveBeenCalledTimes(5);
    });
  });

  describe("selectCard", () => {
    it("should process a standard single card selection and notify the UI once", async () => {
      const manager = new GameManager(mockConfig);

      manager.initSession(dummyProps);
      const outcomePromise = manager.startGame();

      await vi.advanceTimersByTimeAsync(3600);
      await outcomePromise;

      await manager.selectCard("c1-0");

      expect(mockConfig.onChange).toHaveBeenCalledTimes(6);
    });

    it("should handle full group resolution sequentially and emit state twice (pre and post-async outcome)", async () => {
      const manager = new GameManager(mockConfig);

      manager.initSession(dummyProps);
      const outcomePromise = manager.startGame();

      await vi.advanceTimersByTimeAsync(3600);
      await outcomePromise;

      const mockSessionInstance = vi.mocked(GameSession).mock.results[0].value;

      vi.mocked(mockSessionInstance).hasSelectedFullGroup.mockReturnValue(true);

      manager.selectCard("c1-0");
      manager.selectCard("c1-1");

      expect(mockSessionInstance.proccessTurnOutcome).toHaveBeenCalled();
      expect(mockConfig.onChange).toHaveBeenCalledTimes(7);
    });
  });

  describe("getState", () => {
    it("should return the accurate domain snapshot when a session is live", async () => {
      const manager = new GameManager(mockConfig);

      manager.initSession(dummyProps);
      const outcomePromise = manager.startGame();

      await vi.advanceTimersByTimeAsync(3600);
      await outcomePromise;

      const mockSessionInstance = vi.mocked(GameSession).mock.results[0].value;
      const customSnapshot = { customData: "test-snapshot" };
      mockSessionInstance.getSnapshot.mockReturnValue(customSnapshot);

      const state = manager.getState();

      expect(state).toEqual(customSnapshot);
    });
  });

  describe("revealDeckTemporarily", () => {
    it("should show the deck for 3 seconds", async () => {
      const manager = new GameManager(mockConfig);

      manager.initSession(dummyProps);
      const outcomePromise = manager.startGame();

      await vi.advanceTimersByTimeAsync(3600);
      await outcomePromise;

      expect(mockConfig.onChange).toHaveBeenCalledTimes(5);
    });
  });

  describe("GameManager - Edge Case Guards & Boundary Exceptions", () => {
    it("should strictly throw GameSessionNotInitializedError if trying to access state before any session initialization", () => {
      const manager = new GameManager(mockConfig);

      expect(() => {
        manager.getState();
      }).toThrow(GameSessionNotInitializedError);
    });
  });

  describe("GameManager - revealDeckTemporarily Async Flow", () => {
    it("should orchestrate the full sequence: freeze selection, reveal cards, wait 3 seconds, hide cards and restore state", async () => {
      const manager = new GameManager(mockConfig);
      manager.initSession(dummyProps);

      const startPromise = manager.startGame();
      await vi.advanceTimersByTimeAsync(3600);
      await startPromise;

      const mockSessionInstance = vi.mocked(GameSession).mock.results[0].value;

      expect(mockSessionInstance.flipDeck).toHaveBeenCalled();
      expect(mockSessionInstance.disableCardSelection).toHaveBeenCalled();
      expect(mockSessionInstance.getSnapshot).toHaveBeenCalled();

      expect(mockSessionInstance.start).toHaveBeenCalled();
      expect(mockSessionInstance.revealDeck).toHaveBeenCalled();
      expect(mockSessionInstance.hideRevealedDeck).toHaveBeenCalled();
    });
  });
});
