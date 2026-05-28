import { describe, it, expect } from "vitest";
import { NumbersCardThemeProvider } from "../NumbersCardThemeProvider";
import { CardContentType } from "../../../../domain/models/Card";

describe("NumbersCardThemeProvider - Unit Test", () => {
  const provider = new NumbersCardThemeProvider();

  it("should successfully generate and correctly map raw cards format from generated digits", async () => {
    const params = { count: 10 };
    const cards = await provider.fetch(params);

    expect(cards).toBeDefined();
    expect(Array.isArray(cards)).toBe(true);
    expect(cards.length).toBe(params.count);

    cards.forEach((card) => {
      expect(card).toHaveProperty("id");
      expect(typeof card.id).toBe("string");
      expect(Number(card.id)).toBeLessThanOrEqual(100);
      expect(Number(card.id)).toBeGreaterThanOrEqual(0);

      expect(card).toHaveProperty("content");
      expect(typeof card.content).toBe("string");
      expect(card.content).toBe(card.id);

      expect(card).toHaveProperty("type");
      expect(card.type).toBe(CardContentType.Text);

      expect(card).toHaveProperty("title");
      expect(typeof card.title).toBe("string");
      expect(card.title).toBe(`Number ${card.content}`);
    });
  });
});
