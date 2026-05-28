import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameStatus, type GameSessionSnapshot } from "../../../domain/models/GameSession";
import { CardContentType, MemoryCardCardState, type MemoryCard } from "../../../domain/models/Card";
import { useGameStore } from "../gameStore";
import type { InitDeckUseCase } from "../../../application/InitDeckUseCase";
import type { GameManager } from "../../../domain/models/GameManager";
import type { PlayerProgress } from "../../../domain/models/Player";

const mockExecute = vi.fn();
const mockStartGame = vi.fn();
const mockSelectCard = vi.fn();
const mockInitSession = vi.fn();

vi.mock("../../../application/InitDeckUseCase", () => ({
  InitDeckUseCase: function (this: InitDeckUseCase) {
    this.execute = (...args: unknown[]) => mockExecute(...args);
  },
}));

vi.mock("../../../domain/models/GameManager", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const internalRegistry = { cb: (_state: GameSessionSnapshot) => {} };

  return {
    GameManager: function (this: GameManager, params: { onChange: (state: GameSessionSnapshot) => void }) {
      internalRegistry.cb = params.onChange;
      this.startGame = (...args: unknown[]) => mockStartGame(...args);
      this.selectCard = (...args: unknown[]) => mockSelectCard(...args);
      this.initSession = (...args: unknown[]) => mockInitSession(...args);
    },
    _internalRegistry: internalRegistry,
  };
});

vi.mock("../../../../../shared/infrastructure/stores/userSession", () => ({
  useSessionStore: {
    getState() {
      return {
        theme: "rickAndMorty",
        session: { username: "test", id: "1" },
      };
    },
  },
}));

describe("useGameStore - Core Game Zustand Adapter", () => {
  const createMockResult = (isSuccess: boolean, value: unknown = null) => ({
    isSuccess,
    getValue: () => value,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    useGameStore.setState({
      session: null,
      hasError: false,
      loadingDeck: false,
    });
  });

  describe("Initial Default State", () => {
    it("should build the store with proper default configs and inactive flags", () => {
      const state = useGameStore.getState();
      expect(state.session).toBeNull();
      expect(state.hasError).toBe(false);
      expect(state.loadingDeck).toBe(false);
    });
  });

  describe("Game Initialization Flow (startGame)", () => {
    it("should set loading states, fetch cards via use case, and ignite GameManager on success", async () => {
      const mockCardsDeck: MemoryCard[] = [
        {
          id: "card-1",
          groupId: "group-1",
          content: "Ataca a dos objetivos a la vez",
          title: "Mago eléctrico",
          subtitle: "Tropa",
          type: CardContentType.Text,
          state: MemoryCardCardState.Idle,
        },
      ];

      const successResult = createMockResult(true, mockCardsDeck);
      mockExecute.mockResolvedValue(successResult);

      const initPromise = useGameStore.getState().initSession();

      await initPromise;

      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockInitSession).toHaveBeenCalled();
    });

    it("should flag errors and halt initialization pipelines if deck fetch fails", async () => {
      const failureResult = createMockResult(false);
      mockExecute.mockResolvedValue(failureResult);

      await useGameStore.getState().initSession();

      expect(useGameStore.getState().loadingDeck).toBe(false);
      expect(useGameStore.getState().hasError).toBe(true);
      expect(mockStartGame).not.toHaveBeenCalled();
    });
  });

  describe("Domain Subscriptions & Direct Card Interactions", () => {
    it("should bypass and securely pipe selectCard intents straight to the GameManager instance", () => {
      const cardTargetId = "target-card-uuid-123";

      useGameStore.getState().selectCard(cardTargetId);

      expect(mockSelectCard).toHaveBeenCalledTimes(1);
      expect(mockSelectCard).toHaveBeenCalledWith(cardTargetId);
    });

    it("should reactively mutate the store session state when the manager triggers its onChange callback", async () => {
      const { _internalRegistry } = (await import("../../../domain/models/GameManager")) as unknown as {
        _internalRegistry: { cb: CallableFunction };
      };

      const simulatedFreshState: GameSessionSnapshot = {
        status: GameStatus.IDLE,
        scores: {},
        players: [],
        deck: [],
        isProcessing: false,
        activePlayerProgress: {} as PlayerProgress,
      };

      _internalRegistry.cb(simulatedFreshState);

      expect(useGameStore.getState().session).toEqual(simulatedFreshState);
    });
  });
});
