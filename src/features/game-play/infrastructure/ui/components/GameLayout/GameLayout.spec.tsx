import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameLayout, type GameLayoutProps } from "./GameLayout";
import { GameStatus, type GameSessionSnapshot } from "../../../../domain/models/GameSession";
import type { Player, PlayerProgress } from "../../../../domain/models/Player";
import type { MemoryCard } from "../../../../domain/models/Card";

vi.mock("../GameStats", () => ({
  GameStats: vi.fn(() => <div data-testid="game-stats">Game Stats Mounted</div>),
}));

vi.mock("../GameBoard", () => ({
  GameBoard: vi.fn(({ onItemClick, readonly }) => (
    <div data-testid="game-board" data-readonly={readonly} onClick={() => onItemClick("card-123")}>
      Game Board Mounted
    </div>
  )),
}));

vi.mock("../GameSummary", () => ({
  GameSummary: vi.fn(({ onRepeat, onGoHome }) => (
    <div data-testid="game-summary">
      <button data-testid="summary-repeat-btn" onClick={onRepeat}>
        Repeat
      </button>
      <button data-testid="summary-home-btn" onClick={onGoHome}>
        Home
      </button>
    </div>
  )),
}));

vi.mock("../../../../../../../shared/infrastructure/ui/components/ActionMessage", () => ({
  ActionMessage: vi.fn(({ message, actionLabel, onAction }) => (
    <div data-testid="action-message" data-label={actionLabel}>
      <p>{message}</p>
      <button data-testid="msg-action-btn" onClick={onAction}>
        Action
      </button>
    </div>
  )),
}));

describe("GameLayout - Presentational Integration Tests", () => {
  let mockProps: GameLayoutProps;
  let baseSessionMock: {
    status: GameStatus;
    scores: Record<Player["id"], PlayerProgress>;
    players: Array<Player>;
    deck: Array<MemoryCard>;
    isProcessing: boolean;
    activePlayerProgress: PlayerProgress;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    baseSessionMock = {
      status: GameStatus.IDLE,
      isProcessing: false,
      deck: [],
      activePlayerProgress: { score: 0, misses: 0, moves: 4 } as PlayerProgress,
      scores: {},
      players: [],
    };

    mockProps = {
      onPlayBtnClick: vi.fn(),
      onLeaveBtnClick: vi.fn(),
      onGoHome: vi.fn(),
      onSelectCard: vi.fn(),
      session: baseSessionMock as GameSessionSnapshot,
      loadingDeck: false,
      shakeBoard: false,
    };
  });

  describe("Loading State Transitions", () => {
    it("should mount the Spinner component and hide the core GameBoard when loadingDeck is true", () => {
      mockProps.loadingDeck = true;
      render(<GameLayout {...mockProps} />);

      expect(screen.getByRole("progressbar")).toBeDefined();

      expect(screen.queryByTestId("game-board")).toBeNull();
    });
  });

  describe("State Strategy: IDLE Flow", () => {
    it("should render default header typography, action footer, and enforce non-interactive board mode", () => {
      render(<GameLayout {...mockProps} />);

      expect(screen.getByText("Personajes")).toBeDefined();

      expect(screen.getByText("Salir")).toBeDefined();
      const playBtn = screen.getByText("Jugar");
      expect(playBtn).toBeDefined();

      const board = screen.getByTestId("game-board");
      expect(board.getAttribute("data-readonly")).toBe("true");
      fireEvent.click(playBtn);
      expect(mockProps.onPlayBtnClick).toHaveBeenCalled();
    });

    it("should discard action triggers if the session reporting engine is busy processing structural microtasks", () => {
      baseSessionMock.isProcessing = true;
      render(<GameLayout {...mockProps} />);

      const playBtn = screen.getByText("Jugar");
      fireEvent.click(playBtn);

      expect(mockProps.onPlayBtnClick).not.toHaveBeenCalled();
    });
  });

  describe("State Strategy: PLAYING Flow", () => {
    it("should inject active stats layout, release board interaction locks, and drop the navigation footer", () => {
      baseSessionMock.status = GameStatus.PLAYING;
      render(<GameLayout {...mockProps} />);

      expect(screen.getByTestId("game-stats")).toBeDefined();
      const board = screen.getByTestId("game-board");
      expect(board.getAttribute("data-readonly")).toBe("false");

      fireEvent.click(board);
      expect(mockProps.onSelectCard).toHaveBeenCalledWith("card-123");

      expect(screen.queryByText("Salir")).toBeNull();
      expect(screen.queryByText("Jugar")).toBeNull();
    });
  });

  describe("State Strategy: FINISHED Flow", () => {
    it("should tear down the match board and cleanly swap the main screen with the GameSummary component", () => {
      baseSessionMock.status = GameStatus.FINISHED;
      render(<GameLayout {...mockProps} />);

      expect(screen.queryByTestId("game-board")).toBeNull();

      expect(screen.getByTestId("game-summary")).toBeDefined();

      fireEvent.click(screen.getByTestId("summary-repeat-btn"));
      expect(mockProps.onPlayBtnClick).toHaveBeenCalled();

      fireEvent.click(screen.getByTestId("summary-home-btn"));
      expect(mockProps.onGoHome).toHaveBeenCalled();
    });
  });

  describe("Error State Strategy: hasDeckError Boundaries", () => {
    it("should strictly hide GameBoard and footer structures when an initialization error occurs", () => {
      const errorProps = {
        ...mockProps,
        hasDeckError: true,
        session: {
          ...baseSessionMock,
          status: GameStatus.IDLE,
        } as GameSessionSnapshot,
      };

      render(<GameLayout {...errorProps} />);

      expect(screen.queryByTestId("game-board")).toBeNull();
      expect(screen.queryByText("Salir")).toBeNull();
      expect(screen.queryByText("Jugar")).toBeNull();
    });

    it("should render ActionMessage with proper label and trigger the onReload callback on retry click", () => {
      const onReloadSpy = vi.fn();

      const errorProps = {
        ...mockProps,
        hasDeckError: true,
        onReload: onReloadSpy,
        session: {
          ...baseSessionMock,
          status: GameStatus.IDLE,
        } as GameSessionSnapshot,
      };

      render(<GameLayout {...errorProps} />);

      expect(screen.getByText(/Hubo un problema al inicializar el tablero/i)).toBeDefined();

      const retryBtn = screen.getByText("Reintentar");
      fireEvent.click(retryBtn);

      expect(onReloadSpy).toHaveBeenCalledTimes(1);
    });

    it("should suppress ActionMessage display if the deck is actively loading even if hasDeckError is true", () => {
      const loadingErrorProps = {
        ...mockProps,
        hasDeckError: true,
        loadingDeck: true,
        session: {
          ...baseSessionMock,
          status: GameStatus.IDLE,
        } as GameSessionSnapshot,
      };

      render(<GameLayout {...loadingErrorProps} />);

      expect(screen.getByRole("progressbar")).toBeDefined();
      expect(screen.queryByTestId("action-message")).toBeNull();
    });
  });
});
