import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Input } from "../Input";

describe("<Input /> - Shared Atomic Component", () => {
  describe("Accessibility & Node Binding", () => {
    it("should link the label element with the input box via an auto-generated useId when no id parameter is passed", () => {
      render(<Input label="Nombre de Usuario" />);

      const inputElement = screen.getByLabelText("Nombre de Usuario");

      expect(inputElement).toBeInTheDocument();
      expect(inputElement.tagName).toBe("INPUT");
      expect(inputElement.id).toBeTruthy();
    });

    it("should respect and apply the explicit id passed down through properties", () => {
      render(<Input label="Correo Electrónico" id="custom-email-field" />);

      const inputElement = screen.getByLabelText("Correo Electrónico");

      expect(inputElement.id).toBe("custom-email-field");
    });
  });

  describe("Interactions & Event Propagation", () => {
    it("should reflect changes and capture keystrokes correctly when typing", async () => {
      render(<Input label="Escribe algo" defaultValue="" />);

      const inputElement = screen.getByLabelText("Escribe algo");

      await userEvent.type(inputElement, "Vanilla JavaScript");

      expect(inputElement).toHaveValue("Vanilla JavaScript");
    });

    it("should prevent interaction and enforce HTML constraints when disabled", async () => {
      render(<Input label="Bloqueado" disabled defaultValue="No modificable" />);

      const inputElement = screen.getByLabelText("Bloqueado");
      const containerElement = inputElement.closest(".input-container");

      expect(inputElement).toBeDisabled();
      expect(containerElement).toHaveClass("input-container--disabled");

      await userEvent.type(inputElement, "Intento escribir");
      expect(inputElement).toHaveValue("No modificable");
    });
  });

  describe("Conditional Text & Icon Injections", () => {
    it("should prioritize rendering the error string over the helperText when both are supplied", () => {
      const { rerender } = render(
        <Input error="Formato de correo inválido" helperText="Ingresa tu correo institucional" />,
      );

      expect(screen.getByText("Formato de correo inválido")).toBeInTheDocument();
      expect(screen.queryByText("Ingresa tu correo institucional")).toBeNull();

      const containerElement = screen.getByText("Formato de correo inválido").closest(".input-container");
      expect(containerElement).toHaveClass("input-container--error");

      rerender(<Input helperText="Ingresa tu correo institucional" />);
      expect(screen.getByText("Ingresa tu correo institucional")).toBeInTheDocument();
      expect(screen.queryByText("Formato de correo inválido")).toBeNull();
    });

    it("should mount graphic icons and insert structural layout modifier classnames", () => {
      const mockIcon = <span data-testid="input-search-icon">🔍</span>;
      render(<Input icon={mockIcon} />);

      const iconWrapper = screen.getByTestId("input-search-icon");
      const inputElement = screen.getByRole("textbox");

      expect(iconWrapper).toBeInTheDocument();
      expect(inputElement).toHaveClass("input-container__element--has-icon");
    });
  });
});
