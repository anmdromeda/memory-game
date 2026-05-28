import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Alert, type AlertSeverity } from "../Alert";

describe("<Alert /> - Shared Atomic Component", () => {
  describe("Rendering & Severity Contexts", () => {
    it("should render an error alert by default when severity parameter is omitted", () => {
      render(<Alert>Mensaje de error crítico</Alert>);

      const alertElement = screen.getByRole("alert");

      expect(alertElement).toBeInTheDocument();
      expect(alertElement).toHaveClass("alert", "alert--error");
      expect(screen.getByText("Mensaje de error crítico")).toBeInTheDocument();
    });

    it.each(["info", "success", "warning", "error"] as AlertSeverity[])(
      "should append the correct BEM modifier class for severity='%s'",
      (severity) => {
        render(<Alert severity={severity}>Contenido del mensaje</Alert>);

        const alertElement = screen.getByRole("alert");
        expect(alertElement).toHaveClass(`alert--${severity}`);
      },
    );
  });

  describe("Structural Layout & Elements", () => {
    it("should mount and display the title structure only when the title prop is supplied", () => {
      const { rerender } = render(<Alert title="Atención">Hubo un problema</Alert>);

      const titleElement = screen.getByRole("heading", { level: 5, name: /atención/i });
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveClass("alert__title");

      rerender(<Alert>Hubo un problema sin cabecera</Alert>);
      const missingTitleElement = screen.queryByRole("heading", { level: 5 });
      expect(missingTitleElement).toBeNull();
    });

    it("should hide the icon block from screen readers using structural aria-hidden tags", () => {
      const { container } = render(<Alert severity="success">Operación completada</Alert>);

      const iconContainer = container.querySelector(".alert__icon");
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveAttribute("aria-hidden", "true");

      const svgElement = iconContainer?.querySelector("svg");
      expect(svgElement).toBeInTheDocument();
      expect(svgElement).toHaveAttribute("viewBox", "0 0 24 24");
    });
  });

  describe("HTML Attributes Forwarding", () => {
    it("should seamlessly pipeline custom container classnames and native HTML data attributes", () => {
      render(
        <Alert className="global-notification" data-testid="custom-alert-node" id="auth-alert">
          Clase inyectada
        </Alert>,
      );

      const alertElement = screen.getByTestId("custom-alert-node");

      expect(alertElement).toHaveClass("alert", "alert--error", "global-notification");
      expect(alertElement).toHaveAttribute("id", "auth-alert");
    });
  });
});
