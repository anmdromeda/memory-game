import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ColorCardContent } from "./ColorCardContent";
import { ImageCardContent } from "./ImageCardContent";
import { TextCardContent } from "./TextCardContent";

vi.mock("../../../../../../../shared/infrastructure/ui/components/Image", () => ({
  Image: ({
    src,
    alt,
    objectFit,
    objectPosition,
  }: {
    src: string;
    alt: string;
    objectFit: "fill" | "contain" | "cover" | "none" | "scale-down";
    objectPosition: string;
  }) => <img data-testid="mock-shared-image" src={src} alt={alt} style={{ objectFit, objectPosition }} />,
}));

describe("GameCard Content Strategy Variants", () => {
  describe("<ColorCardContent />", () => {
    it("should paint the correct solid background color via inline styles", () => {
      const testColor = "#FF5733";
      render(<ColorCardContent color={testColor} />);

      const wrapperElement = screen.getByLabelText(`Carta de color ${testColor}`);

      expect(wrapperElement).toBeInTheDocument();
      expect(wrapperElement).toHaveClass("game-card-color-wrapper");
      expect(wrapperElement).toHaveStyle({ backgroundColor: testColor });
    });

    it("should update its computed background styles dynamically when color changes", () => {
      const { rerender } = render(<ColorCardContent color="#00FF00" />);
      expect(screen.getByLabelText("Carta de color #00FF00")).toHaveStyle({ backgroundColor: "#00FF00" });

      rerender(<ColorCardContent color="#0000FF" />);
      expect(screen.getByLabelText("Carta de color #0000FF")).toHaveStyle({ backgroundColor: "#0000FF" });
    });
  });

  describe("<ImageCardContent />", () => {
    it("should forward structural dimensions and media descriptors to the shared image component", () => {
      render(<ImageCardContent src="clash_pekka.png" alt="Mini P.E.K.K.A." />);

      const imageElement = screen.getByTestId("mock-shared-image") as HTMLImageElement;

      expect(imageElement).toBeInTheDocument();
      expect(imageElement.src).toContain("clash_pekka.png");
      expect(imageElement.alt).toBe("Mini P.E.K.K.A.");
      expect(imageElement).toHaveStyle({
        objectFit: "cover",
        objectPosition: "top",
      });
    });

    it("should contain the semantic wrapping layout container class for layout scoping", () => {
      const { container } = render(<ImageCardContent src="avatar.png" alt="Avatar" />);

      const wrapper = container.querySelector(".game-card-image-wrapper");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toContainElement(screen.getByTestId("mock-shared-image"));
    });
  });

  describe("<TextCardContent />", () => {
    it("should securely map and output raw descriptions into the internal typography spans", () => {
      const sampleText = "Genera descargas eléctricas al desplegarse";
      render(<TextCardContent text={sampleText} />);

      const containerWrapper = screen.getByTestId("text-card-content");
      expect(containerWrapper).toBeInTheDocument();
      expect(containerWrapper).toHaveClass("game-card-text-wrapper");

      const textSpan = containerWrapper.querySelector(".game-card-text-wrapper__text");
      expect(textSpan).toBeInTheDocument();
      expect(textSpan).toHaveTextContent(sampleText);
    });
  });
});
