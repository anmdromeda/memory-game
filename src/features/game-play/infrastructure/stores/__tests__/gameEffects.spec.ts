import { describe, it, expect, vi, beforeEach } from "vitest";
import type { GameEffectsCallbacks, GameEffectsManager } from "../../../domain/models/GameEffects";
import { useGameEffectsStore } from "../gameEffects";
import { inMemoryEventBus } from "../../../../../shared/infrastructure/bus/InMemoryEventBus";

const mockPlayMatchError = vi.fn().mockResolvedValue(undefined);

const mockShakeBoard = vi.fn().mockImplementation(function (this: GameEffectsManager) {
  this.callbacks?.onBoardShake(true);
  this.callbacks?.onBoardShake(false);
  return Promise.resolve();
});

vi.mock("../../effects/Html5GameEffects", () => ({
  HTML5GameEffectsManager: function (this: GameEffectsManager, callbacks: GameEffectsCallbacks) {
    this.callbacks = callbacks;
    this.playMatchError = mockPlayMatchError;
    this.shakeBoard = mockShakeBoard;
  },
}));

describe("useGameEffectsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useGameEffectsStore.setState({
      isBoardShaking: false,
    });
  });

  it("should execute infrastructure effects when a match error occurs", async () => {
    const unsubscribe = useGameEffectsStore.getState().bootstrapEffects();

    inMemoryEventBus.emit("game-play:cards-group-flipped", { isMatch: false });

    expect(mockPlayMatchError).toHaveBeenCalledTimes(1);
    expect(mockShakeBoard).toHaveBeenCalledTimes(1);

    expect(useGameEffectsStore.getState().isBoardShaking).toBe(false);

    unsubscribe();
  });

  it("should do nothing if cards match successfully", () => {
    const unsubscribe = useGameEffectsStore.getState().bootstrapEffects();

    inMemoryEventBus.emit("game-play:cards-group-flipped", { isMatch: true });

    expect(mockPlayMatchError).not.toHaveBeenCalled();
    expect(mockShakeBoard).not.toHaveBeenCalled();

    unsubscribe();
  });
});
