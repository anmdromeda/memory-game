import { describe, it, expect, vi, beforeEach } from "vitest";
import { HTML5GameEffectsManager } from "../Html5GameEffects";
import type { GameEffectsCallbacks } from "../../../domain/models/GameEffects";

describe("HTML5GameEffectsManager - Infrastructure Effects Adapter", () => {
  let mockCallbacks: GameEffectsCallbacks;
  let manager: HTML5GameEffectsManager;

  const mockConnect = vi.fn();
  const mockSetValueAtTime = vi.fn();
  const mockExponentialRampToValueAtTime = vi.fn();
  const mockLinearRampToValueAtTime = vi.fn();
  const mockStart = vi.fn();
  const mockStop = vi.fn();

  const createMockAudioNode = () => ({
    connect: mockConnect,
    frequency: {
      setValueAtTime: mockSetValueAtTime,
      exponentialRampToValueAtTime: mockExponentialRampToValueAtTime,
      linearRampToValueAtTime: mockLinearRampToValueAtTime,
    },
    gain: {
      setValueAtTime: mockSetValueAtTime,
      exponentialRampToValueAtTime: mockExponentialRampToValueAtTime,
    },
    start: mockStart,
    stop: mockStop,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockCallbacks = {
      onBoardShake: vi.fn(),
    };

    const mockAudioContextInstance = {
      state: "running",
      currentTime: 10,
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn().mockReturnValue(createMockAudioNode()),
      createGain: vi.fn().mockReturnValue(createMockAudioNode()),
    };

    class MockAudioContext {
      state = mockAudioContextInstance.state;
      currentTime = mockAudioContextInstance.currentTime;
      destination = mockAudioContextInstance.destination;
      resume = mockAudioContextInstance.resume;
      createOscillator = mockAudioContextInstance.createOscillator;
      createGain = mockAudioContextInstance.createGain;
    }

    vi.stubGlobal("AudioContext", MockAudioContext);

    vi.stubGlobal("navigator", {
      vibrate: vi.fn(),
    });

    manager = new HTML5GameEffectsManager(mockCallbacks);
  });

  describe("Audio Effects Pipeline", () => {
    it("should build the synthesizer graph and trigger a card flip frequency ramp", async () => {
      await manager.playCardFlip();

      expect(mockSetValueAtTime).toHaveBeenCalledWith(300, 10);
      expect(mockExponentialRampToValueAtTime).toHaveBeenCalledWith(600, 10.1);
      expect(mockStart).toHaveBeenCalledTimes(1);
      expect(mockStop).toHaveBeenCalledWith(10.1);
    });

    it("should process an error frequency wave down to its resolution limit", async () => {
      await manager.playMatchError();

      expect(mockSetValueAtTime).toHaveBeenCalledWith(180, 10);
      expect(mockLinearRampToValueAtTime).toHaveBeenCalledWith(70, 10.3);
      expect(mockStop).toHaveBeenCalledWith(10.3);
    });

    it("should play consecutive notes sequentially during a match success event", async () => {
      const playPromise = manager.playMatchSuccess();

      await vi.advanceTimersByTimeAsync(100);
      await playPromise;

      expect(mockStart).toHaveBeenCalledTimes(2);
    });
  });

  describe("Haptic and Visual Feedback (shakeBoard)", () => {
    it("should pipe haptic feedback to the hardware and cycle the layout shaking flags cleanly", async () => {
      const shakePromise = manager.shakeBoard();

      expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100]);
      expect(mockCallbacks.onBoardShake).toHaveBeenCalledWith(true);
      expect(mockCallbacks.onBoardShake).not.toHaveBeenCalledWith(false);

      await vi.advanceTimersByTimeAsync(400);
      await shakePromise;

      expect(mockCallbacks.onBoardShake).toHaveBeenLastCalledWith(false);
      expect(mockCallbacks.onBoardShake).toHaveBeenCalledTimes(2);
    });
  });
});
