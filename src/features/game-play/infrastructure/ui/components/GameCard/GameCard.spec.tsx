import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { GameCard } from "./GameCard";
import { CardContentType, MemoryCardCardState } from "../../../../domain/models/Card";
import type { MemoryCard } from "../../../../domain/models/Card";
import React from "react";

vi.mock("./variants/TextCardContent", () => ({
  TextCardContent: ({ text }: { text: string }) => <div data-testid="mock-text-variant">{text}</div>,
}));

vi.mock("./variants/ColorCardContent", () => ({
  ColorCardContent: ({ color }: { color: string }) => (
    <div data-testid="mock-color-variant" style={{ backgroundColor: color }} />
  ),
}));

vi.mock("./variants/ImageCardContent", () => ({
  ImageCardContent: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="mock-image-variant" src={src} alt={alt} />
  ),
}));


vi.mock("../../../../../../shared/infrastructure/ui/components/Heading", () => ({
  Heading: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className} data-testid="mock-heading">
      {children}
    </span>
  ),
}));

describe("<GameCard /> - Feature Infrastructure Component", () => {
  const createMockCard = (overrides?: Partial<MemoryCard>): MemoryCard => ({
    id: "card-id-123",
    groupId: "group-clash-1",
    title: "Mago eléctrico",
    subtitle: "Tropa Legendaria",
    type: CardContentType.Text,
    content: "Ataca a dos objetivos a la vez",
    state: MemoryCardCardState.Idle,
    ...overrides,
  });

  describe("State Classes & Semantic Layout", () => {
    it("should compile correct BEM state class names from the memory card domain model", () => {
      const cardData = createMockCard({ state: MemoryCardCardState.Flipped });
      render(<GameCard card={cardData} />);

      const cardButton = screen.getByRole("button");

      expect(cardButton).toBeInTheDocument();
      expect(cardButton).toHaveClass("game-card", "game-card--FLIPPED");
    });

    it("should render both accessible structural layers (front and back of the card)", () => {
      const cardData = createMockCard();
      const { container } = render(<GameCard card={cardData} />);

      const frontFace = container.querySelector(".game-card__front");
      const backFace = container.querySelector(".game-card__back");

      expect(frontFace).toBeInTheDocument();
      expect(backFace).toBeInTheDocument();
      expect(screen.getByText("❓")).toBeInTheDocument(); 
    });
  });

  describe("Polymorphic Content Renderers (OCP)", () => {
    it("should trigger TextCardContent strategy when content type is Text", () => {
      const cardData = createMockCard({ type: CardContentType.Text, content: "Texto de prueba" });
      render(<GameCard card={cardData} />);

      const textVariant = screen.getByTestId("mock-text-variant");
      expect(textVariant).toBeInTheDocument();
      expect(textVariant).toHaveTextContent("Texto de prueba");
      expect(screen.queryByTestId("mock-color-variant")).toBeNull();
    });

    it("should trigger ColorCardContent strategy when content type is Color", () => {
      const cardData = createMockCard({ type: CardContentType.Color, content: "#FF0000" });
      render(<GameCard card={cardData} />);

      const colorVariant = screen.getByTestId("mock-color-variant");
      expect(colorVariant).toBeInTheDocument();
      expect(colorVariant).toHaveStyle({ backgroundColor: "#FF0000" });
    });

    it("should trigger ImageCardContent strategy when content type is Image", () => {
      const cardData = createMockCard({
        type: CardContentType.Image,
        content: "clash_royale_king.png",
        title: "Rey Azul",
      });
      render(<GameCard card={cardData} />);

      const imageVariant = screen.getByTestId("mock-image-variant") as HTMLImageElement;
      expect(imageVariant).toBeInTheDocument();
      expect(imageVariant.src).toContain("clash_royale_king.png");
      expect(imageVariant.alt).toBe("Rey Azul");
    });
  });

  describe("Metadata & Optional Headings", () => {
    it("should render header text titles using the shared Heading component wrapper", () => {
      const cardData = createMockCard({ title: "P.E.K.K.A.", subtitle: "Tropa Épica" });
      render(<GameCard card={cardData} />);

      const headings = screen.getAllByTestId("mock-heading");

      expect(headings[0]).toHaveTextContent("P.E.K.K.A.");
      expect(headings[1]).toHaveTextContent("Tropa Épica");
    });

    it("should completely omit the subtitle node element when parameter is absent from domain schema", () => {
      const cardData = createMockCard({ subtitle: undefined });
      render(<GameCard card={cardData} />);

      const headings = screen.getAllByTestId("mock-heading");

      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveTextContent(cardData.title);
    });
  });

  describe("Interactions & Behavioral Callbacks", () => {
    it("should trigger the custom onClick callback and dispatch the domain entity object as parameter", async () => {
      const mockOnClick = vi.fn();
      const cardData = createMockCard();
      render(<GameCard card={cardData} onClick={mockOnClick} />);

      const cardButton = screen.getByRole("button");
      await userEvent.click(cardButton);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(cardData);
    });

    it("should execute flawlessly and not crash execution runtime environments when onClick is omitted", async () => {
      const cardData = createMockCard();
      render(<GameCard card={cardData} onClick={undefined} />);

      const cardButton = screen.getByRole("button");

      await vi.waitFor(async () => {
        await userEvent.click(cardButton);
      });
    });
  });
});
