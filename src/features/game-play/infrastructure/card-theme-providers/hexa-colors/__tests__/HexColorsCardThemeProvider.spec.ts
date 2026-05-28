import { describe, it, expect } from "vitest";
import { HexaColorsCardThemeProvider } from "../HexColorsCardThemeProvider";
import { CardContentType } from "../../../../domain/models/Card";
import { generateFriendlyColor, getHexaColorsList, hslToHex } from "../hexColorsUtils";

describe("HexaColorsCardThemeProvider - Unit Test", () => {
  const provider = new HexaColorsCardThemeProvider();

  it("should successfully generate and correctly map raw cards format from generated colors", async () => {
    const params = { count: 6 };
    const cards = await provider.fetch(params);

    expect(cards).toBeDefined();
    expect(Array.isArray(cards)).toBe(true);
    expect(cards.length).toBe(params.count);

    cards.forEach((card) => {
      expect(card).toHaveProperty("id");
      expect(typeof card.id).toBe("string");
      expect(card.id).toMatch(/^#[0-9a-fA-F]{6}$/);

      expect(card).toHaveProperty("content");
      expect(typeof card.content).toBe("string");
      expect(card.content).toBe(card.id);

      expect(card).toHaveProperty("type");
      expect(card.type).toBe(CardContentType.Color);

      expect(card).toHaveProperty("title");
      expect(card.title).toBe(card.content);
    });
  });
});

describe("HexaColors Utility Functions", () => {
  describe("hslToHex", () => {
    it("should correctly convert HSL values to a valid hex color string", () => {
      expect(hslToHex(0, 0, 0)).toBe("#000000");
      expect(hslToHex(0, 0, 100)).toBe("#ffffff");
      expect(hslToHex(0, 100, 50)).toBe("#ff0000");
    });
  });

  describe("generateFriendlyColor", () => {
    it("should generate a string matching a valid hex format", () => {
      const color = generateFriendlyColor();
      expect(typeof color).toBe("string");
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe("getHexaColorsList", () => {
    it("should return an array of hex colors with the requested length", () => {
      const count = 4;
      const list = getHexaColorsList(count);

      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(count);
      list.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it("should distribute colors across the spectrum based on step distribution", () => {
      const list = getHexaColorsList(2);

      expect(list[0]).toBe(hslToHex(0, 70, 60));
      expect(list[1]).toBe(hslToHex(180, 70, 60));
    });
  });
});
