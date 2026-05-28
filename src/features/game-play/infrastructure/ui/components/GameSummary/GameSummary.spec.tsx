import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameSummary } from "./GameSummary";

describe("GameSummary - Presentational Component Unit Tests", () => {
  it("should display the congratulations heading and interpolate the exact amount of turns correctly", () => {
    const testTurns = 14;

    render(<GameSummary turns={testTurns} />);

    expect(screen.getByText("¡Felicitaciones!")).toBeDefined();
    expect(screen.getByText("Terminaste el juego con 14 turnos")).toBeDefined();
  });

  it("should successfully trigger the operational action callbacks when clicking control buttons", () => {
    const onRepeatSpy = vi.fn();
    const onGoHomeSpy = vi.fn();

    render(<GameSummary turns={8} onRepeat={onRepeatSpy} onGoHome={onGoHomeSpy} />);

    const repeatButton = screen.getByRole("button", { name: "Repetir" });
    const homeButton = screen.getByRole("button", { name: "Inicio" });

    fireEvent.click(repeatButton);
    fireEvent.click(homeButton);

    expect(onRepeatSpy).toHaveBeenCalledTimes(1);
    expect(onGoHomeSpy).toHaveBeenCalledTimes(1);
  });
});
