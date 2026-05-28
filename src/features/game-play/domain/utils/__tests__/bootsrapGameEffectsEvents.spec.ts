import { describe, it, expect, vi, beforeEach } from "vitest";
import { bootstrapGameEffectsEvents } from "../bootstrapGameEffectsEvents";
import type { GameEffectsManager } from "../../models/GameEffects";
import type { EventBus } from "../../../../../shared/application/EventBus";

describe("bootstrapGameEffectsEvents - Unit Tests", () => {
  const mockManager: GameEffectsManager = {
    playCardFlip: vi.fn().mockResolvedValue(undefined),
    playMatchSuccess: vi.fn().mockResolvedValue(undefined),
    playMatchError: vi.fn().mockResolvedValue(undefined),
    shakeBoard: vi.fn().mockResolvedValue(undefined),
    triggerCelebration: vi.fn().mockResolvedValue(undefined),
    playButtonPress: vi.fn().mockResolvedValue(undefined),
  };

  let registeredListeners: { [key: string]: (payload?: unknown) => void };
  const mockUnsubscribe = vi.fn();

  const mockEventBus: EventBus = {
    on: vi.fn().mockImplementation((eventName: string, callback: (payload?: unknown) => void) => {
      registeredListeners[eventName] = callback;
      return mockUnsubscribe;
    }),
    emit: vi.fn(),
    off: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    registeredListeners = {};
  });

  it("should trigger playMatchSuccess when game-play:cards-group-flipped resolves as a match", () => {
    bootstrapGameEffectsEvents({ manager: mockManager as GameEffectsManager, eventBus: mockEventBus });

    registeredListeners["game-play:cards-group-flipped"]({ isMatch: true });

    expect(mockManager.playMatchSuccess).toHaveBeenCalledTimes(1);
    expect(mockManager.playMatchError).not.toHaveBeenCalled();
    expect(mockManager.shakeBoard).not.toHaveBeenCalled();
  });

  it("should orchestrate error sounds and board vibrations sequentially when a match fails", () => {
    bootstrapGameEffectsEvents({ manager: mockManager, eventBus: mockEventBus });

    registeredListeners["game-play:cards-group-flipped"]({ isMatch: false });

    expect(mockManager.playMatchError).toHaveBeenCalledTimes(1);
    expect(mockManager.shakeBoard).toHaveBeenCalledTimes(1);
    expect(mockManager.playMatchSuccess).not.toHaveBeenCalled();
  });

  it("should pipe the flip sound trigger when a single card-flipped event is broadcasted", () => {
    bootstrapGameEffectsEvents({ manager: mockManager, eventBus: mockEventBus });

    registeredListeners["game-play:card-flipped"]();

    expect(mockManager.playCardFlip).toHaveBeenCalledTimes(1);
  });

  it("should initialize the celebration suite when the match-ended signal drops", () => {
    bootstrapGameEffectsEvents({ manager: mockManager, eventBus: mockEventBus });

    registeredListeners["game-play:match-ended"]();

    expect(mockManager.triggerCelebration).toHaveBeenCalledTimes(1);
  });

  it("should execute all unsubscription tokens concurrently when calling the teardown function", () => {
    const dispose = bootstrapGameEffectsEvents({ manager: mockManager, eventBus: mockEventBus });

    dispose();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(4);
  });
});
