import { describe, it, expect } from "vitest";
import { ArrayShuffler } from "../arrayShuffler";

describe("ArrayShuffler - Unit Test", () => {
  it("should return a new array with the same length as the original input", () => {
    const input = [1, 2, 3, 4, 5];
    const result = ArrayShuffler.shuffle(input);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(input.length);
  });

  it("should preserve all original elements after shuffling", () => {
    const input = ["a", "b", "c", "d"];
    const result = ArrayShuffler.shuffle(input);

    expect(result).toHaveLength(input.length);
    input.forEach((item) => {
      expect(result).toContain(item);
    });
  });

  it("should not mutate the original input array", () => {
    const input = [10, 20, 30, 40];
    const originalReference = [...input];

    ArrayShuffler.shuffle(input);

    expect(input).toEqual(originalReference);
  });

  it("should change the order of elements for a sufficiently large array", () => {
    const input = Array.from({ length: 50 }, (_, i) => i);
    const result = ArrayShuffler.shuffle(input);

    expect(result).not.toEqual(input);
  });

  it("should handle an empty array gracefully", () => {
    const input: number[] = [];
    const result = ArrayShuffler.shuffle(input);

    expect(result).toEqual([]);
  });

  it("should handle a single-element array gracefully", () => {
    const input = [42];
    const result = ArrayShuffler.shuffle(input);

    expect(result).toEqual([42]);
  });
});
