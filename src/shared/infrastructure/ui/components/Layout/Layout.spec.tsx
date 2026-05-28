import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Layout } from "../Layout";

describe("<Layout /> - Shared Structural Component", () => {
  describe("Core Structural Layout & Content", () => {
    it("should always render the core main content block with its proper accessibility role", () => {
      render(
        <Layout>
          <div data-testid="test-child">Contenido Principal de la Aplicación</div>
        </Layout>,
      );

      const mainElement = screen.getByRole("main");
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass("layout__content");

      const childElement = screen.getByTestId("test-child");
      expect(childElement).toBeInTheDocument();
      expect(mainElement).toContainElement(childElement);
    });
  });

  describe("Optional Layout Injections & Semantic Roles", () => {
    it("should mount the header landmark only when a navbar node is supplied", () => {
      const mockNavbar = <nav data-testid="mock-nav">Barra de Navegación</nav>;

      const { rerender } = render(
        <Layout navbar={mockNavbar}>
          <p>Contenido</p>
        </Layout>,
      );

      const headerElement = screen.getByRole("banner");
      expect(headerElement).toBeInTheDocument();
      expect(headerElement).toHaveClass("layout__header");
      expect(screen.getByTestId("mock-nav")).toBeInTheDocument();

      rerender(
        <Layout navbar={undefined}>
          <p>Contenido</p>
        </Layout>,
      );
      expect(screen.queryByRole("banner")).toBeNull();
    });

    it("should mount the footer landmark only when a footer node is supplied", () => {
      const mockFooter = <span data-testid="mock-footer">Pie de Página</span>;

      const { rerender } = render(
        <Layout footer={mockFooter}>
          <p>Contenido</p>
        </Layout>,
      );

      const footerElement = screen.getByRole("contentinfo");
      expect(footerElement).toBeInTheDocument();
      expect(footerElement).toHaveClass("layout__footer");
      expect(screen.getByTestId("mock-footer")).toBeInTheDocument();

      rerender(
        <Layout footer={undefined}>
          <p>Contenido</p>
        </Layout>,
      );
      expect(screen.queryByRole("contentinfo")).toBeNull();
    });
  });

  describe("CSS Modifier and Layout Forwarding", () => {
    it("should append custom classnames to the outermost container wrapper", () => {
      const { container } = render(
        <Layout className="dashboard-theme-layout">
          <p>Vista</p>
        </Layout>,
      );

      const layoutRootElement = container.firstChild as HTMLElement;

      expect(layoutRootElement).toHaveClass("layout");
      expect(layoutRootElement).toHaveClass("dashboard-theme-layout");
    });
  });
});
