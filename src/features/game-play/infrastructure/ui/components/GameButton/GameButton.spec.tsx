import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameButton } from "./GameButton";
import { inMemoryEventBus } from "../../../../../../shared/infrastructure/bus/InMemoryEventBus";
import type{ GameButtonAction } from "../../../../domain/models/GameSession";

vi.mock("../../../../../../shared/infrastructure/bus/InMemoryEventBus", () => ({
  inMemoryEventBus: {
    emit: vi.fn(),
  },
}));

vi.mock("../../../../../../shared/infrastructure/ui/components/Button", () => ({
  Button: vi.fn(({ onClick, children, ...props }) => (
    <button data-testid="shared-button" onClick={onClick} {...props}>
      {children}
    </button>
  )),
}));

describe("GameButton - Event-Driven UI Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Structural Rendering & Props Passthrough", () => {
    it("should render children content and forward standard button html attributes", () => {
      render(
        <GameButton action="play" onClick={vi.fn()} disabled type="submit">
          Iniciar Partida
        </GameButton>,
      );

      const buttonElement = screen.getByTestId("shared-button");
      expect(screen.getByText("Iniciar Partida")).toBeDefined();
      expect(buttonElement.getAttribute("disabled")).not.toBeNull();
      expect(buttonElement.getAttribute("type")).toBe("submit");
    });
  });

  describe("Event Orchestration Flow", () => {
    it("should trigger local onClick callback and broadcast infrastructure domain events simultaneously", () => {
      const onClickSpy = vi.fn();
      const validAction: GameButtonAction = "repeat";

      render(
        <GameButton action={validAction} onClick={onClickSpy}>
          Reintentar
        </GameButton>,
      );

      const buttonElement = screen.getByTestId("shared-button");
      fireEvent.click(buttonElement);

      expect(onClickSpy).toHaveBeenCalledTimes(1);
      expect(onClickSpy).toHaveBeenCalledWith(expect.any(Object));
      expect(inMemoryEventBus.emit).toHaveBeenCalledTimes(1);
      expect(inMemoryEventBus.emit).toHaveBeenCalledWith("game-play:button-pressed", {
        action: "repeat",
      });
    });
  });

  describe("Defensive Edge Cases & Guard Clauses", () => {
    it("should completely abort execution and suppress event dispatching if action is empty", () => {
      const onClickSpy = vi.fn();

      render(
        <GameButton action={"" as unknown as GameButtonAction} onClick={onClickSpy}>
          Botón Corrupto
        </GameButton>,
      );

      const buttonElement = screen.getByTestId("shared-button");
      fireEvent.click(buttonElement);

      expect(onClickSpy).not.toHaveBeenCalled();
      expect(inMemoryEventBus.emit).not.toHaveBeenCalled();
    });

    it("should intercept and suppress execution when action consists only of empty whitespace strings", () => {
      const onClickSpy = vi.fn();

      render(
        <GameButton action={"   " as unknown as GameButtonAction} onClick={onClickSpy}>
          Espacios en Blanco
        </GameButton>,
      );

      const buttonElement = screen.getByTestId("shared-button");
      fireEvent.click(buttonElement);

      expect(onClickSpy).not.toHaveBeenCalled();
      expect(inMemoryEventBus.emit).not.toHaveBeenCalled();
    });

    it("should strictly suppress global event dispatching if no local onClick handler is supplied", () => {
      render(<GameButton action="leave">Salir sin onClick</GameButton>);

      const buttonElement = screen.getByTestId("shared-button");
      fireEvent.click(buttonElement);

      expect(inMemoryEventBus.emit).not.toHaveBeenCalled();
    });
  });
});
