import { delay } from "../../../../shared/domain/utils/delay";
import { GameSessionNotInitializedError } from "../errors/GameSessionErrors";
import type { MemoryCard } from "./Card";
import { GameSession, type GameSessionConfig, type GameSessionSnapshot } from "./GameSession";

export class GameManager {
  private session: GameSession | null = null;

  constructor(
    private readonly config: {
      onChange?(state: GameSessionSnapshot): void;
    },
  ) {}

  public async revealDeckTemporarily() {
    if (!this.session) {
      throw new GameSessionNotInitializedError("showDeck");
    }

    this.session.revealDeck();
    this.config?.onChange?.(this.session.getSnapshot());

    await delay(GameSession.REVEAL_DECK_DELAY_MS);

    this.session.hideRevealedDeck();

    this.config?.onChange?.(this.session.getSnapshot());
  }

  public initSession(config: GameSessionConfig) {
    this.session = new GameSession({ ...config });
    this.config?.onChange?.(this.getState());
  }

  public restartSession() {
    if (!this.session) {
      throw new GameSessionNotInitializedError("showDeck");
    }

    this.session.init();
    this.config?.onChange?.(this.getState());
  }

  public async startGame() {
    if (!this.session) {
      throw new GameSessionNotInitializedError("showDeck");
    }

    this.session.flipDeck();
    this.session.disableCardSelection();
    this.config?.onChange?.(this.getState());

    await delay(GameSession.CARD_FLIP_DELAY_MS);

    this.session.start();
    this.config?.onChange?.(this.getState());

    await delay(GameSession.CARD_FLIP_DELAY_MS);
    this.revealDeckTemporarily();
  }

  public async selectCard(id: MemoryCard["id"]) {
    if (!this.session) {
      throw new GameSessionNotInitializedError("selectCard");
    }

    this.session.selectCard(id);
    this.config?.onChange?.(this.getState());

    if (this.session.hasSelectedFullGroup()) {
      await this.session.proccessTurnOutcome();
      this.config?.onChange?.(this.getState());
    }
  }

  public getState(): GameSessionSnapshot {
    if (!this.session) {
      throw new GameSessionNotInitializedError("getState");
    }

    return this.session.getSnapshot();
  }
}
