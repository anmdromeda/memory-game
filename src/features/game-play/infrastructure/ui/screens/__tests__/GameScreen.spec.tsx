import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useGameEffectsStore } from "../../../stores/gameEffects";
import { useGameStore } from "../../../stores/gameStore";
import { GameScreen } from "../GameScreen";
import { inMemoryEventBus } from "../../../../../../shared/infrastructure/bus/InMemoryEventBus";

vi.mock("../../../stores/gameStore", () => ({
  useGameStore: vi.fn(),
}));

vi.mock("../../../stores/gameEffects", () => ({
  useGameEffectsStore: vi.fn(),
}));

vi.mock("../../../../../../shared/infrastructure/bus/InMemoryEventBus", () => ({
  inMemoryEventBus: {
    emit: vi.fn(),
  },
}));

vi.mock("../../components/GameLayout", () => ({
  GameLayout: vi.fn(({ onPlayBtnClick, onLeaveBtnClick, onGoHome, onSelectCard, session }) => (
    <div data-testid="mock-game-layout">
      <button data-testid="btn-play" onClick={onPlayBtnClick}>
        Play
      </button>
      <button data-testid="btn-leave" onClick={onLeaveBtnClick}>
        Leave
      </button>
      <button data-testid="btn-home" onClick={onGoHome}>
        Home
      </button>
      <button data-testid="btn-select" onClick={() => onSelectCard("card-id-456")}>
        Select Card
      </button>
      <div data-testid="session-status">{session?.status ?? "no-session"}</div>
    </div>
  )),
}));

describe("GameScreen - Container Orchestration Integration Tests", () => {
  let mockTeardown: Mock;
  let mockBootstrapEffects: Mock;
  let mockInitSession: Mock;
  let mockSelectCard: Mock;
  let mockStartGame: Mock;
  let mockEndGame: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTeardown = vi.fn();
    mockBootstrapEffects = vi.fn().mockReturnValue(mockTeardown);
    mockInitSession = vi.fn();
    mockSelectCard = vi.fn();
    mockStartGame = vi.fn();
    mockEndGame = vi.fn();

    vi.mocked(useGameEffectsStore).mockImplementation((selector: CallableFunction) =>
      selector({
        isBoardShaking: false,
        bootstrapEffects: mockBootstrapEffects,
      }),
    );

    vi.mocked(useGameStore).mockImplementation((selector: CallableFunction) =>
      selector({
        session: { status: "PLAYING" },
        loadingDeck: false,
        initSession: mockInitSession,
        selectCard: mockSelectCard,
        startGame: mockStartGame,
        endGame: mockEndGame,
      }),
    );
  });

  describe("Lifecycle & Bootstrap Effects", () => {
    it("should trigger bootstrap initialization and load deck procedures immediately upon component mount", () => {
      render(<GameScreen />);

      expect(mockBootstrapEffects).toHaveBeenCalledTimes(1);
      expect(mockInitSession).toHaveBeenCalledTimes(1);
    });

    it("should rigorously invoke the exact teardown function returned by bootstrap when component unmounts", () => {
      const { unmount } = render(<GameScreen />);

      unmount();
      expect(mockTeardown).toHaveBeenCalledTimes(1);
    });
  });

  describe("Store Actions & Infrastructure Bus Routing", () => {
    it("should forward presentational layout clicks to the global Zustand gameplay triggers", () => {
      render(<GameScreen />);

      fireEvent.click(screen.getByTestId("btn-play"));
      expect(mockStartGame).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("btn-select"));
      expect(mockSelectCard).toHaveBeenCalledWith("card-id-456");

      fireEvent.click(screen.getByTestId("btn-home"));
      expect(mockEndGame).toHaveBeenCalledTimes(1);
    });

    it("should broadcast a logout command via InMemoryEventBus infrastructure channel upon leave invocation", () => {
      render(<GameScreen />);

      fireEvent.click(screen.getByTestId("btn-leave"));

      expect(inMemoryEventBus.emit).toHaveBeenCalledWith("auth:logout-requested");
    });
  });
});
