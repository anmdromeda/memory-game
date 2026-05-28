import { describe, it, expect } from "vitest";
import { computedClassNames } from "../computedClassNames";

describe("computedClassNames - Utility Unit Tests", () => {
  it("should concatenate keys whose evaluation values are strictly true", () => {
    const input = {
      "game-card": true,
      "is-flipped": true,
      "is-matched": false,
    };

    const result = computedClassNames(input);

    expect(result).toBe("game-card is-flipped");
  });

  it("should clean and trim accidental whitespaces from class strings", () => {
    const input = {
      "  card-shaking  ": true,
      "theme-classic ": true,
    };

    const result = computedClassNames(input);

    expect(result).toBe("card-shaking theme-classic");
  });

  it("should return an empty string if all evaluated values are false", () => {
    const input = {
      "disabled-state": false,
      "error-border": false,
    };

    const result = computedClassNames(input);

    expect(result).toBe("");
  });

  it("should safely ignore empty or invalid keys even if their value evaluates to true", () => {
    const input = {
      "": true,
      "   ": true,
      "valid-class": true,
    };

    const result = computedClassNames(input);

    expect(result).toBe("valid-class");
  });
});
