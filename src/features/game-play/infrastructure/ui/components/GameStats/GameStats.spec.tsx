import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameStats } from "./GameStats";
import type { PlayerProgress } from "../../../../domain/models/Player";

describe("GameStats - Presentational Component Unit Tests", () => {
  it("should extract and display the active score and turns tracking points correctly", () => {
    const mockProgress = {
      score: 4,
      moves: 12,
      misses: 8,
    } as unknown as PlayerProgress;

    render(<GameStats playerProgress={mockProgress} />);

    expect(screen.getByText("Aciertos: 4")).toBeDefined();
    expect(screen.getByText("Turnos: 12")).toBeDefined();
  });

  it("should maintain structural list hierarchy and correct semantic tags layout", () => {
    const mockProgress = {
      score: 0,
      moves: 0,
    } as unknown as PlayerProgress;

    render(<GameStats playerProgress={mockProgress} />);

    const listElement = screen.getByRole("list");
    expect(listElement.className).toContain("game-stats");

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(2);
    expect(listItems[0].className).toContain("game-stats__item");
  });
});
