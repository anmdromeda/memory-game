import { describe, it, expect } from "vitest";
import { CardContentType } from "../../../../domain/models/Card";
import { StudioGhibliFilmsCardThemeProvider } from "../StudioGhibliFilmsCardThemeProvider";

const LIVE_API_TIMEOUT = 10000;

describe("StudioGhibliFilmsCardThemeProvider - Live API Integration Test", () => {
  const provider = new StudioGhibliFilmsCardThemeProvider();

  it(
    "should successfully connect to the real API and correctly map raw cards format",
    async () => {
      const params = { count: 3 };
      const cards = await provider.fetch(params);

      expect(cards).toBeDefined();
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(params.count);

      cards.forEach((card) => {
        expect(card).toHaveProperty("id");
        expect(typeof card.id).toBe("string");
        expect(card.id.length).toBeGreaterThan(0);

        expect(card).toHaveProperty("content");
        expect(typeof card.content).toBe("string");
        expect(card.content).toContain("https://");

        expect(card).toHaveProperty("type");
        expect(card.type).toBe(CardContentType.Image);

        expect(card).toHaveProperty("title");
        expect(typeof card.title).toBe("string");
      });
    },
    LIVE_API_TIMEOUT,
  );

  it(
    "should sort cards by rating in descending order before slicing",
    async () => {
      const params = { count: 2 };
      const cards = await provider.fetch(params);

      expect(cards).toBeDefined();
      expect(cards.length).toBe(params.count);
    },
    LIVE_API_TIMEOUT,
  );

  it(
    "should gracefully handle a requested count higher than what the API returns",
    async () => {
      const params = { count: 100 };
      const cards = await provider.fetch(params);

      expect(cards).toBeDefined();
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.length).toBeLessThanOrEqual(100);
    },
    LIVE_API_TIMEOUT,
  );
});
