import { describe, it, expect, vi, beforeEach } from "vitest";
import { InMemoryEventBus } from "../InMemoryEventBus";
import type { Events } from "../../../application/EventBus";

describe("InMemoryEventBus - Unit Test", () => {
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    eventBus = new InMemoryEventBus();
  });

  describe("Subscription Management (on / off / clear)", () => {
    it("should successfully trigger a subscription callback when an event is emitted", () => {
      const callback = vi.fn();
      const payload: Events["game-play:cards-group-flipped"] = { isMatch: false };

      eventBus.on("game-play:cards-group-flipped", callback);
      eventBus.emit("game-play:cards-group-flipped", payload);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(payload);
    });

    it("should return a functional unsubscribe cleanup function when calling 'on'", () => {
      const callback = vi.fn();
      const payload: Events["game-play:cards-group-flipped"] = { isMatch: true };

      const unsubscribe = eventBus.on("game-play:cards-group-flipped", callback);

      eventBus.emit("game-play:cards-group-flipped", payload);
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      eventBus.emit("game-play:cards-group-flipped", payload);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should successfully remove a listener using the explicit 'off' method", () => {
      const callback = vi.fn();
      const payload: Events["game-play:cards-group-flipped"] = { isMatch: false };

      eventBus.on("game-play:cards-group-flipped", callback);
      eventBus.off("game-play:cards-group-flipped", callback);
      eventBus.emit("game-play:cards-group-flipped", payload);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should selectively clear a single event bucket when a target key is specified", () => {
      const matchEndCallback = vi.fn();
      const gameCallback = vi.fn();

      eventBus.on("game-play:match-ended", matchEndCallback);
      eventBus.on("game-play:cards-group-flipped", gameCallback);

      eventBus.clear("game-play:cards-group-flipped");

      eventBus.emit("game-play:match-ended", { scores: {} });
      eventBus.emit("game-play:cards-group-flipped", { isMatch: false });

      expect(matchEndCallback).toHaveBeenCalledTimes(1);
      expect(gameCallback).not.toHaveBeenCalled();
    });

    it("should wipe out the entire registry mapping if 'clear' is executed without target keys", () => {
      const matchEndCallback = vi.fn();
      const gameCallback = vi.fn();

      eventBus.on("game-play:match-ended", matchEndCallback);
      eventBus.on("game-play:cards-group-flipped", gameCallback);

      eventBus.clear();

      eventBus.emit("game-play:match-ended", { scores: {} });
      eventBus.emit("game-play:cards-group-flipped", { isMatch: true });

      expect(matchEndCallback).not.toHaveBeenCalled();
      expect(gameCallback).not.toHaveBeenCalled();
    });
  });

  describe("Resilience & Defensive Fault Tolerance", () => {
    it("should absorb exceptions thrown inside subscribers without disrupting downstream callbacks", () => {
      const faultyCallback = vi.fn().mockImplementation(() => {
        throw new Error("Subscriber internal processing crash");
      });
      const healthyCallback = vi.fn();
      const payload: Events["game-play:cards-group-flipped"] = { isMatch: false };

      eventBus.on("game-play:cards-group-flipped", faultyCallback);
      eventBus.on("game-play:cards-group-flipped", healthyCallback);

      expect(() => {
        eventBus.emit("game-play:cards-group-flipped", payload);
      }).not.toThrow();

      expect(faultyCallback).toHaveBeenCalledTimes(1);
      expect(healthyCallback).toHaveBeenCalledTimes(1);
    });

    it("should process emits silently if no active subscribers exist for the event key", () => {
      expect(() => {
        eventBus.emit("game-play:cards-group-flipped", { isMatch: false });
      }).not.toThrow();
    });
  });
});
