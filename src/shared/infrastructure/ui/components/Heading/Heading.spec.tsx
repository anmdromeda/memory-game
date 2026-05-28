import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Heading } from "../Heading";

describe("<Heading /> - Shared Atomic Component", () => {
  describe("Semantic HTML Tag Generation", () => {
    it("should render an h1 element by default when no type parameter is supplied", () => {
      render(<Heading>Título por Defecto</Heading>);

      const headingElement = screen.getByRole("heading", { level: 1 });

      expect(headingElement).toBeInTheDocument();
      expect(headingElement.tagName).toBe("H1");
      expect(headingElement).toHaveTextContent("Título por Defecto");
    });

    it.each([
      { type: "h1", level: 1 },
      { type: "h2", level: 2 },
      { type: "h3", level: 3 },
      { type: "h4", level: 4 },
      { type: "h5", level: 5 },
      { type: "h6", level: 6 },
    ] as const)("should correctly mount an <$type /> tag when type is set to $type", ({ type, level }) => {
      render(<Heading type={type}>Título Dinámico</Heading>);

      const headingElement = screen.getByRole("heading", { level });

      expect(headingElement).toBeInTheDocument();
      expect(headingElement.tagName).toBe(type.toUpperCase());
    });
  });

  describe("Style Modifiers & Class Accumulation", () => {
    it("should compile correct BEM class names matching size and alignment properties", () => {
      render(
        <Heading type="h2" size="xl" align="center" className="dashboard__title">
          Contenido de Prueba
        </Heading>,
      );

      const headingElement = screen.getByRole("heading", { level: 2 });

      expect(headingElement).toHaveClass("heading");
      expect(headingElement).toHaveClass("heading--xl");
      expect(headingElement).toHaveClass("heading--center");
      expect(headingElement).toHaveClass("dashboard__title");
    });

    it("should secure default fallback classes if optional styling props are omitted", () => {
      render(<Heading type="h3">Fallback Styles</Heading>);

      const headingElement = screen.getByRole("heading", { level: 3 });

      expect(headingElement).toHaveClass("heading");
      expect(headingElement).toHaveClass("heading--base");
      expect(headingElement).toHaveClass("heading--left");
    });
  });

  describe("HTML Rest Attributes Forwarding", () => {
    it("should pass down standard native HTML properties like 'id' or aria attributes to the element", () => {
      render(
        <Heading type="h1" id="main-heading-node" aria-hidden="false">
          Accesible
        </Heading>,
      );

      const headingElement = screen.getByRole("heading", { level: 1 });

      expect(headingElement).toHaveAttribute("id", "main-heading-node");
      expect(headingElement).toHaveAttribute("aria-hidden", "false");
    });
  });
});
