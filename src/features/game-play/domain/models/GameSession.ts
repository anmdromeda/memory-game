import type { EventBus } from "../../../../shared/application/EventBus";
import { ArrayShuffler } from "../../../../shared/domain/utils/arrayShuffler";
import { delay } from "../../../../shared/domain/utils/delay";
import { EmptyPlayerListError } from "../errors/GameSessionErrors";
import { CardsValidator } from "../utils/cardsValidator";
import { MemoryCardCardState, type MemoryCard } from "./Card";
import type { GameDifficulty } from "./GameDifficulty";
import { PlayerProgress, type Player } from "./Player";

export enum GameStatus {
  IDLE = "IDLE",
  PLAYING = "PLAYING",
  FINISHED = "FINISHED",
}

export type GameButtonAction = "play" | "leave" | "go-home" | "repeat";

export type GameSessionConfig = {
  difficulty: GameDifficulty;
  players: Array<Player>;
  rawDeck: Array<MemoryCard>;
  eventBus: EventBus;
};

export interface GameSessionSnapshot {
  readonly status: GameStatus;
  readonly scores: Record<Player["id"], PlayerProgress>;
  readonly players: Array<Player>;
  readonly deck: Array<MemoryCard>;
  readonly isProcessing: boolean;
  readonly activePlayerProgress: PlayerProgress;
}

export class GameSession {
  static REVEAL_DECK_DELAY_MS = 3000;
  static CARD_FLIP_DELAY_MS = 300;
  static MISMATCH_DELAY_MS = 1000;

  private activePlayerIndex: number = 0;
  private readonly scores: Record<string, PlayerProgress> = {};
  private selectedCards: MemoryCard[] = [];
  private deckMap = new Map<MemoryCard["id"], MemoryCard>();
  private isProcessing: boolean = false;
  private status: GameStatus = GameStatus.IDLE;
  private revealedDeck: Array<MemoryCard> = [];

  constructor(private readonly config: GameSessionConfig) {
    if (this.config.players.length === 0) {
      throw new EmptyPlayerListError();
    }

    this.init();
  }

  private initScores(players: Array<Player>) {
    players.forEach((player) => {
      this.scores[player.id] = PlayerProgress.create();
    });
  }

  private initDeck(cards: MemoryCard[]) {
    cards.forEach((card) => this.deckMap.set(card.id, { ...card, state: MemoryCardCardState.Flipped }));
  }

  public revealDeck() {
    if (this.isProcessing) return;

    this.revealedDeck = this.getDeckSnapshot().filter((card) => card.state !== MemoryCardCardState.Matched);

    this.deckMap.clear();

    this.revealedDeck.forEach((card) => {
      this.deckMap.set(card.id, { ...card, state: MemoryCardCardState.Flipped });
    });

    this.disableCardSelection();
  }

  public hideRevealedDeck() {
    this.revealedDeck.forEach((card) => this.deckMap.set(card.id, card));
    this.enableCardSelection();
    this.revealedDeck = [];
  }

  private shuffleDeck() {
    const shuffledList = ArrayShuffler.shuffle(this.getDeckSnapshot());

    this.deckMap.clear();

    shuffledList.forEach((card) => {
      this.deckMap.set(card.id, { ...card, state: MemoryCardCardState.Idle });
    });
  }

  public disableCardSelection() {
    this.isProcessing = true;
  }

  public enableCardSelection() {
    this.isProcessing = false;
  }

  public flipDeck() {
    this.deckMap.forEach((card) => {
      this.deckMap.set(card.id, {
        ...card,
        state: card.state === MemoryCardCardState.Idle ? MemoryCardCardState.Flipped : MemoryCardCardState.Idle,
      });
    });
  }

  public init() {
    this.status = GameStatus.IDLE;
    this.initDeck(this.config.rawDeck);
    this.initScores(this.config.players);
    this.isProcessing = false;
    this.activePlayerIndex = 0;
    this.revealedDeck = [];
  }

  public start() {
    this.init();
    this.shuffleDeck();
    this.status = GameStatus.PLAYING;
    this.enableCardSelection();
  }

  public finish() {
    this.config.eventBus.emit("game-play:match-ended", { scores: this.scores });
    this.status = GameStatus.FINISHED;
  }

  private getActivePlayer(): Player {
    return this.config.players[this.activePlayerIndex];
  }

  private registerMatch(player: Player): void {
    if (this.isFinished()) return;

    const currentProgress = this.scores[player.id];
    this.scores[player.id] = currentProgress.incrementMatch();

    if (this.checkIsGameOver()) {
      this.finish();
    }
  }

  private registerMiss(player: Player): void {
    if (this.isFinished()) return;

    const currentProgress = this.scores[player.id];
    this.scores[player.id] = currentProgress.incrementMiss();
  }

  public isFinished() {
    return this.status === GameStatus.FINISHED;
  }

  public hasStarted() {
    return this.status === GameStatus.PLAYING;
  }

  private nextTurn(): void {
    if (this.isFinished()) return;
    this.activePlayerIndex = (this.activePlayerIndex + 1) % this.config.players.length;
  }

  private getDeckSnapshot() {
    return [...this.deckMap.values()].map((card) => ({ ...card }));
  }

  public checkIsGameOver(): boolean {
    const totalMatchesFound = Object.values(this.scores).reduce((sum, progress) => sum + progress.score, 0);
    return totalMatchesFound === this.config.difficulty.getTotalMatches();
  }

  public selectCard(pickedCardId: MemoryCard["id"]) {
    const selectedCard = this.deckMap.get(pickedCardId);

    if (!selectedCard) {
      return;
    }

    const isSelectable = CardsValidator.isSelectableCard(selectedCard);

    if (this.isFinished() || !isSelectable || this.isProcessing || !this.hasStarted()) {
      return;
    }

    const updatedCard: MemoryCard = { ...selectedCard, state: MemoryCardCardState.Flipped };

    this.config.eventBus.emit("game-play:card-flipped", { cardId: updatedCard.id });

    this.selectedCards.push(updatedCard);
    this.selectedCards.forEach((card) => this.deckMap.set(card.id, card));
  }

  public hasSelectedFullGroup() {
    return this.selectedCards.length === this.config.difficulty?.getMatchGroupSize();
  }

  public async proccessTurnOutcome() {
    if (this.isProcessing) return;

    const activePlayer = this.getActivePlayer();

    const isMatch = this.hasMatchingGroup({
      cards: this.selectedCards,
    });

    this.disableCardSelection();

    await delay(GameSession.CARD_FLIP_DELAY_MS);

    if (isMatch) {
      await delay(GameSession.CARD_FLIP_DELAY_MS);
      this.registerMatch(activePlayer);
    } else {
      this.registerMiss(activePlayer);
      await delay(GameSession.MISMATCH_DELAY_MS);
    }

    this.config.eventBus.emit("game-play:cards-group-flipped", { isMatch });

    const newState = isMatch ? MemoryCardCardState.Matched : MemoryCardCardState.Idle;

    this.selectedCards.forEach((card) => this.deckMap.set(card.id, { ...card, state: newState }));
    this.selectedCards = [];

    this.nextTurn();
    this.enableCardSelection();
  }

  private hasMatchingGroup(params: { cards: MemoryCard[] }) {
    try {
      CardsValidator.ensureNonEmptyRequest(params);
      CardsValidator.ensureAreNotSameCards(params);
      CardsValidator.ensurAreNotMatchedCards(params);

      return CardsValidator.hasSameGroupId(params);
    } catch {
      return false;
    }
  }

  public getSnapshot(): GameSessionSnapshot {
    return {
      deck: this.getDeckSnapshot(),
      status: this.status,
      players: [...this.config.players],
      scores: { ...this.scores },
      isProcessing: this.isProcessing,
      activePlayerProgress: this.scores[this.getActivePlayer().id],
    };
  }
}
