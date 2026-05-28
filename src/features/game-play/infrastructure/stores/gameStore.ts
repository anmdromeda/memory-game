import { create } from "zustand";
import type { GameSessionSnapshot } from "../../domain/models/GameSession";
import type { MemoryCard } from "../../domain/models/Card";
import { InitDeckUseCase } from "../../application/InitDeckUseCase";
import { GameThemeProviderFactory } from "../card-theme-providers/factory/RawCardThemeProviderFactory";
import { GameManager } from "../../domain/models/GameManager";
import { Difficulty, GameDifficulty } from "../../domain/models/GameDifficulty";
import { useSessionStore } from "../../../../shared/infrastructure/stores/userSession";
import type { UserSession } from "../../../../shared/domain/models/UserSession";
import { inMemoryEventBus } from "../../../../shared/infrastructure/bus/InMemoryEventBus";

interface GameStore {
  startGame(): Promise<void>;
  selectCard(id: MemoryCard["id"]): void;
  session: GameSessionSnapshot | null;
  hasError: boolean;
  loadingDeck: boolean;
  endGame(): void;
  initSession(): Promise<void>;
}

const initDeckUseCase = new InitDeckUseCase(new GameThemeProviderFactory());

const difficulty = GameDifficulty.create({
  groupDifficulty: Difficulty.Easy,
  deckSizeDifficulty: Difficulty.Easy,
});

export const useGameStore = create<GameStore>((set, get) => {
  const manager = new GameManager({
    onChange: (freshState) => {
      set({
        session: freshState,
      });
    },
  });

  return {
    session: null,
    hasError: false,
    loadingDeck: false,

    selectCard: (id: MemoryCard["id"]) => manager.selectCard(id),

    async initSession() {
      set({ loadingDeck: true });

      const deckResult = await initDeckUseCase.execute({
        difficulty,
        theme: useSessionStore.getState().theme?.name as string,
      });

      set({ hasError: !deckResult.isSuccess, loadingDeck: false });

      if (!deckResult.isSuccess) {
        return;
      }

      const userSession = useSessionStore.getState().session as UserSession;

      manager.initSession({
        difficulty,
        eventBus: inMemoryEventBus,
        players: [{ name: userSession.username, id: userSession.id }],
        rawDeck: deckResult.getValue(),
      });
    },

    async startGame() {
      await manager.startGame();
    },

    async endGame() {
      manager.restartSession();
      get().initSession();
    },
  };
});
