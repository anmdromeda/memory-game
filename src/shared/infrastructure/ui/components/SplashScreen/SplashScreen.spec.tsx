import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SplashScreen } from "../SplashScreen";

vi.mock("../Spinner/Spinner", () => ({
  Spinner: ({ size, className }: { size?: string; className?: string }) => (
    <div data-testid="mock-spinner" data-size={size} className={className} />
  ),
}));

describe("<SplashScreen /> - Shared Structural Component", () => {
  describe("Core Rendering", () => {
    it("should mount the layout wrapper and display the large spinner by default", () => {
      render(<SplashScreen />);

      const containerElement = screen.getByTestId("mock-spinner").closest(".splash-screen");
      expect(containerElement).toBeInTheDocument();

      const spinnerElement = screen.getByTestId("mock-spinner");
      expect(spinnerElement).toBeInTheDocument();
      expect(spinnerElement).toHaveAttribute("data-size", "lg");
      expect(spinnerElement).toHaveClass("splash-screen__spinner");
    });
  });

  describe("Conditional Composition Slots", () => {
    it("should render the logo slot only when a custom element node is provided", () => {
      const mockLogo = <img src="logo.png" alt="Clash Royale Logo" data-testid="custom-logo" />;

      const { rerender } = render(<SplashScreen logo={mockLogo} />);

      const logoWrapper = screen.getByTestId("custom-logo").closest(".splash-screen__logo");
      expect(logoWrapper).toBeInTheDocument();
      expect(screen.getByTestId("custom-logo")).toBeInTheDocument();

      rerender(<SplashScreen logo={undefined} />);
      expect(screen.queryByTestId("custom-logo")).toBeNull();
    });

    it("should render the informational message text only when provided", () => {
      const testMessage = "Cargando recursos del juego...";

      const { rerender } = render(<SplashScreen message={testMessage} />);

      const messageElement = screen.getByText(testMessage);
      expect(messageElement).toBeInTheDocument();
      expect(messageElement.tagName).toBe("P");
      expect(messageElement).toHaveClass("splash-screen__message");
      rerender(<SplashScreen message={undefined} />);
      expect(screen.queryByText(testMessage)).toBeNull();
    });
  });
});
