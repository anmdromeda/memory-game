import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Spinner } from "../Spinner";

describe("<Spinner /> - Shared Atomic Component", () => {
  describe("Style Modifiers & Class Accumulation", () => {
    it("should render with default style modifiers when size and variant parameters are omitted", () => {
      const { container } = render(<Spinner />);
      const spinnerElement = container.firstChild as HTMLElement;

      expect(spinnerElement).toBeInTheDocument();
      expect(spinnerElement).toHaveClass("spinner", "spinner--md", "spinner--primary");
    });

    it("should compile correct BEM class names matching size and variant properties", () => {
      const { container } = render(<Spinner size="lg" className="loading-overlay__spinner" />);

      const spinnerElement = container.firstChild as HTMLElement;

      expect(spinnerElement).toHaveClass("spinner");
      expect(spinnerElement).toHaveClass("spinner--lg");
      expect(spinnerElement).toHaveClass("loading-overlay__spinner");
    });
  });

  describe("Internal DOM Structure", () => {
    it("should include the structural inner ring div required for the CSS animation keyframes", () => {
      const { container } = render(<Spinner size="sm" />);

      const spinnerElement = container.firstChild as HTMLElement;
      const ringElement = spinnerElement.querySelector(".spinner__ring");

      expect(ringElement).toBeInTheDocument();
      expect(spinnerElement).toContainElement(ringElement! as HTMLElement);
    });
  });
});
