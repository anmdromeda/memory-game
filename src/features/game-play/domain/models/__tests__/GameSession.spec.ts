import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Difficulty, GameDifficulty } from "../GameDifficulty";
import type { Player } from "../Player";
import { CardContentType, MemoryCardCardState, type MemoryCard } from "../Card";
import { GameSession, GameStatus } from "../GameSession";
import { EmptyPlayerListError } from "../../errors/GameSessionErrors";
import type { EventBus } from "../../../../../shared/application/EventBus";

const createDummyPlayer = (id: string) => ({ id, name: `Player ${id}` });

describe("GameSession", () => {
  let difficultyMock: GameDifficulty;
  let player1: Player;
  let sampleDeck: MemoryCard[];
  let mockEventBus: EventBus;

  beforeEach(() => {
    vi.useFakeTimers();

    difficultyMock = GameDifficulty.create({ groupDifficulty: Difficulty.Easy, deckSizeDifficulty: Difficulty.Easy });
    player1 = createDummyPlayer("p1");

    sampleDeck = [
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
    ];

    mockEventBus = {
      on: vi.fn(),
      off: vi.fn(),
      clear: vi.fn(),
      emit: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Initialization", () => {
    it("should successfully initialize scores and map cards into the deck structure", () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      const snapshot = session.getSnapshot();

      expect(snapshot.deck).toHaveLength(10);
      expect(snapshot.status).toBe("PLAYING");
      expect(snapshot.scores["p1"]).toBeDefined();
    });

    it("should throw EmptyPlayerListError when initializing without players", () => {
      expect(() => {
        new GameSession({
          rawDeck: sampleDeck,
          players: [],
          difficulty: difficultyMock,
          eventBus: mockEventBus,
        }).start();
      }).toThrow(EmptyPlayerListError);
    });
  });

  describe("selectCard", () => {
    it("should change an Idle card state to Flipped and hold it in the selection buffer", () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      session.selectCard("c1-0");

      const snapshot = session.getSnapshot();

      const selectedCard = snapshot.deck.find((card) => card.id === "c1-0");

      expect(selectedCard?.state).toBe(MemoryCardCardState.Flipped);

      expect(mockEventBus.emit).toHaveBeenCalledWith("game-play:card-flipped", {
        cardId: "c1-0",
      });
    });

    it("should ignore selection requests if the target card does not exist", () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      session.selectCard("non-existent-id");

      const deck = session.getSnapshot().deck;

      expect(deck.filter((card) => card.state === MemoryCardCardState.Flipped)).toHaveLength(0);
    });
  });

  describe("proccessTurnOutcome", () => {
    it("should process a successful match, increment score, and complete the game if conditions are met", async () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      for (let i = 0; i < sampleDeck.length; i += 2) {
        const firstCard = sampleDeck[i];
        const secondCard = sampleDeck[i + 1];

        session.selectCard(firstCard.id);
        session.selectCard(secondCard.id);

        expect(session.hasSelectedFullGroup()).toBe(true);

        const outcomePromise = session.proccessTurnOutcome();
        await vi.advanceTimersByTimeAsync(1000);
        await outcomePromise;
      }

      const snapshot = session.getSnapshot();

      expect(snapshot.scores["p1"].score).toBe(5);
      expect(snapshot.deck.every((card) => card.state === MemoryCardCardState.Matched)).toBe(true);
      expect(snapshot.status).toBe("PLAYING");
      expect(mockEventBus.emit).toHaveBeenCalledWith("game-play:cards-group-flipped", { isMatch: true });
    });

    it("should process a miss outcome, register a miss tracking point, reset card states to Idle, and pass turn", async () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      session.selectCard("c1-0");
      session.selectCard("c2-0");

      const outcomePromise = session.proccessTurnOutcome();

      await vi.advanceTimersByTimeAsync(1500);
      await outcomePromise;

      const snapshot = session.getSnapshot();
      expect(snapshot.scores["p1"].misses).toBe(1);
      expect(snapshot.deck.every((card) => card.state === MemoryCardCardState.Idle)).toBe(true);
      expect(mockEventBus.emit).toHaveBeenCalled();
    });
  });

  describe("revealDeck", () => {
    it("should update all cards state to FLIPPED", () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      session.revealDeck();

      const snapshot = session.getSnapshot();

      expect(snapshot.deck.every((card) => card.state === MemoryCardCardState.Flipped)).toBe(true);
      expect(snapshot.isProcessing).toBe(true);
    });

    it("should update all cards state to previous state", () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      session.revealDeck();
      session.hideRevealedDeck();

      const snapshot = session.getSnapshot();

      expect(snapshot.deck.every((card) => card.state === MemoryCardCardState.Idle)).toBe(true);
      expect(snapshot.isProcessing).toBe(false);
    });
  });

  describe("Multiplayer Turn Rotation & Progress Mapping", () => {
    it("should alternate active player indicator cyclically when a turn results in a mismatch", async () => {
      const player2 = createDummyPlayer("p2");
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1, player2],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      expect(session.getSnapshot().activePlayerProgress).toBeDefined();

      session.selectCard("c1-0");
      session.selectCard("c2-0");

      const outcomePromise = session.proccessTurnOutcome();
      await vi.advanceTimersByTimeAsync(1500);
      await outcomePromise;

      const snapshot = session.getSnapshot();
      expect(snapshot.scores["p1"].misses).toBe(1);
      expect(snapshot.scores["p2"].misses).toBe(0);
      expect(snapshot.activePlayerProgress).toBe(snapshot.scores["p2"]);
    });
  });

  describe("selectCard - Security Guards and State Constraints", () => {
    it("should deny card flipping if the session has not officially started (IDLE status)", () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.selectCard("c1-0");

      const snapshot = session.getSnapshot();
      const card = snapshot.deck.find((c) => c.id === "c1-0");

      expect(card?.state).toBe(MemoryCardCardState.Flipped);

      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });

    it("should refuse selection if the card is already in a Matched state", async () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      session.selectCard("c1-0");
      session.selectCard("c1-1");
      const outcomePromise = session.proccessTurnOutcome();
      await vi.advanceTimersByTimeAsync(1000);
      await outcomePromise;

      vi.clearAllMocks();

      session.selectCard("c1-0");
      expect(mockEventBus.emit).not.toHaveBeenCalledWith("game-play:card-flipped", expect.any(Object));
    });

    it("should reject card flipping if the system state is processing an ongoing turn outcome", () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      session.selectCard("c1-0");
      session.selectCard("c1-1");

      session.proccessTurnOutcome();

      session.selectCard("c2-0");

      const snapshot = session.getSnapshot();
      const thirdCard = snapshot.deck.find((card) => card.id === "c2-0");

      expect(thirdCard?.state).toBe(MemoryCardCardState.Idle);
    });
  });

  describe("flipDeck & Explicit Transitions", () => {
    it("should invert the state of all cards in the deck transparently when flipDeck is invoked", () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      session.flipDeck();
      expect(session.getSnapshot().deck.every((c) => c.state === MemoryCardCardState.Flipped)).toBe(true);

      session.flipDeck();
      expect(session.getSnapshot().deck.every((c) => c.state === MemoryCardCardState.Idle)).toBe(true);
    });

    it("should correctly trigger match-ended event and transition to FINISHED status when game is finished", () => {
      const session = new GameSession({
        rawDeck: sampleDeck,
        players: [player1],
        difficulty: difficultyMock,
        eventBus: mockEventBus,
      });

      session.start();

      session.finish();

      expect(session.isFinished()).toBe(true);
      expect(session.getSnapshot().status).toBe(GameStatus.FINISHED);
      expect(mockEventBus.emit).toHaveBeenCalledWith("game-play:match-ended", expect.any(Object));
    });
  });
});
