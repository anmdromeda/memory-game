import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "../Button";

vi.mock("../Spinner", () => ({
  Spinner: ({ className }: { className?: string }) => <span data-testid="mock-spinner" className={className} />,
}));

describe("<Button /> - Shared Atomic Component", () => {
  describe("Rendering & Composition", () => {
    it("should render the button text using the 'label' prop natively", () => {
      render(<Button label="Confirmar Acción" />);

      const buttonElement = screen.getByRole("button", { name: /confirmar acción/i });
      expect(buttonElement).toBeInTheDocument();
      expect(buttonElement).toHaveTextContent("Confirmar Acción");
    });

    it("should render correctly using 'children' when 'label' is omitted", () => {
      render(
        <Button>
          <span>Texto desde Children</span>
        </Button>,
      );

      const buttonElement = screen.getByRole("button", { name: /texto desde children/i });
      expect(buttonElement).toBeInTheDocument();
    });

    it("should aggregate classes dynamically based on the configured variant and size props", () => {
      const { rerender } = render(<Button label="Styles" className="custom-class" />);
      let buttonElement = screen.getByRole("button");

      expect(buttonElement).toHaveClass("button", "custom-class");

      rerender(<Button label="Styles" />);
      buttonElement = screen.getByRole("button");
      expect(buttonElement).toHaveClass("button", "button--primary");
    });
  });

  describe("Interactions & Behavior State", () => {
    it("should trigger the onClick callback when a user fires a click event", async () => {
      const mockOnClick = vi.fn();
      render(<Button label="Click Me" onClick={mockOnClick} />);

      const buttonElement = screen.getByRole("button", { name: /click me/i });

      await userEvent.click(buttonElement);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should respect the native 'disabled' property constraint and reject clicks", async () => {
      const mockOnClick = vi.fn();
      render(<Button label="Disabled" disabled onClick={mockOnClick} />);

      const buttonElement = screen.getByRole("button", { name: /disabled/i });

      expect(buttonElement).toBeDisabled();
      await userEvent.click(buttonElement);
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });
});
