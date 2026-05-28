import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorScreen } from "./ErrorScreen";

describe("ErrorScreen - Fallback UI Component Unit Tests", () => {
  it("should mount safely in the DOM tree and display the generic unexpected failure message", () => {
    render(<ErrorScreen />);

    expect(screen.getByRole("heading", { name: "¡Ups! Algo salió mal" })).toBeDefined();

    expect(screen.getByText(/Lo sentimos, ha ocurrido un error inesperado/i)).toBeDefined();
  });

  it("should preserve the structural layout styling classes for accurate BEM alignment", () => {
    const { container } = render(<ErrorScreen />);

    const mainWrapper = container.querySelector(".error-screen");
    expect(mainWrapper).not.toBeNull();

    const contentSurface = container.querySelector(".error-screen__content");
    expect(contentSurface).not.toBeNull();
  });
});
