import { describe, it, expect, vi } from "vitest";
import { delay } from "../delay";

describe("delay - Unit Test", () => {
  it("should resolve after the specified amount of time", async () => {
    const ms = 150;
    const startTime = performance.now();

    await delay(ms);

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeGreaterThanOrEqual(ms - 10);
  });

  it("should utilize global setTimeout timers correctly using fake timers", async () => {
    vi.useFakeTimers();

    const ms = 5000;
    const promise = delay(ms);

    vi.advanceTimersByTime(ms);

    await expect(promise).resolves.toBeUndefined();

    vi.useRealTimers();
  });
});
