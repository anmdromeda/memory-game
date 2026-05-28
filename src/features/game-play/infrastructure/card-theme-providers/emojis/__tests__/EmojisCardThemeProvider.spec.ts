import { describe, it, expect } from "vitest";
import { EmojisCardThemeProvider } from "../EmojisCardThemeProvider";
import { CardContentType } from "../../../../domain/models/Card";

describe("EmojisCardThemeProvider - Unit Test", () => {
  const provider = new EmojisCardThemeProvider();

  it("should successfully shuffle and correctly map raw cards format from local data", async () => {
    const params = { count: 5 };
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
      expect(card.content.length).toBeGreaterThan(0);

      expect(card).toHaveProperty("type");
      expect(card.type).toBe(CardContentType.Text);

      expect(card).toHaveProperty("title");
      expect(typeof card.title).toBe("string");

      expect(card).toHaveProperty("subtitle");
      expect(typeof card.subtitle).toBe("string");
    });
  });

  it("should gracefully handle a requested count higher than the available dataset", async () => {
    const params = { count: 9999 };
    const cards = await provider.fetch(params);

    expect(cards).toBeDefined();
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThanOrEqual(9999);
  });
});
