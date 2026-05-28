import { describe, it, expect } from "vitest";
import { PokeApiCardThemeProvider } from "../PokeApiCardThemeProvider";
import { CardContentType } from "../../../../domain/models/Card";

const LIVE_API_TIMEOUT = 15000;

describe("PokeApiCardThemeProvider - Live API Integration Test", () => {
  const provider = new PokeApiCardThemeProvider();

  it(
    "should successfully connect to the real API, resolve nested details, and correctly map raw cards format",
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
        expect(card.content).toContain("https://raw.githubusercontent.com/PokeAPI/sprites/");

        expect(card).toHaveProperty("type");
        expect(card.type).toBe(CardContentType.Image);

        expect(card).toHaveProperty("title");
        expect(typeof card.title).toBe("string");

        expect(card).toHaveProperty("subtitle");
        expect(typeof card.subtitle).toBe("string");
      });
    },
    LIVE_API_TIMEOUT,
  );

  it(
    "should gracefully handle a requested count higher than what the API default page returns",
    async () => {
      const params = { count: 25 };
      const cards = await provider.fetch(params);

      expect(cards).toBeDefined();
      expect(cards.length).toBe(params.count);
    },
    LIVE_API_TIMEOUT,
  );
});
