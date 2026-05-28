import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameBoard } from "./GameBoard";
import { MemoryCardCardState, CardContentType, type MemoryCard } from "../../../../domain/models/Card";

vi.mock("../../../../../../shared/infrastructure/stores/userSession", () => ({
  useSessionStore: vi.fn((selector) => {
    const mockState = {
      theme: {
        tokens: {
          component: {
            brandLogoBack: "https://cdn.test/mock-brand-back-logo.png",
          },
        },
      },
    };
    return selector(mockState);
  }),
}));

vi.mock("../GameCard/GameCard", () => ({
  GameCard: vi.fn(({ card, onClick, backFaceLogo }) => (
    <div data-testid={`game-card-${card.id}`} data-backlogo={backFaceLogo} onClick={onClick}>
      Card {card.id} - State: {card.state}
    </div>
  )),
}));

describe("GameBoard - Grid Container Integration Tests", () => {
  let sampleItems: MemoryCard[];
  let onItemClickSpy: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    onItemClickSpy = vi.fn();

    sampleItems = [
      {
        id: "card-A",
        groupId: "group-1",
        state: MemoryCardCardState.Idle,
        content: "",
        type: CardContentType.Image,
        title: "",
      },
      {
        id: "card-B",
        groupId: "group-1",
        state: MemoryCardCardState.Idle,
        content: "",
        type: CardContentType.Image,
        title: "",
      },
    ];
  });

  it("should securely mount the full deck collection grid and pass down theme logos to every card", () => {
    render(<GameBoard items={sampleItems} onItemClick={onItemClickSpy} />);

    expect(screen.getByRole("list")).toBeDefined();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    const physicalCard = screen.getByTestId("game-card-card-A");
    expect(physicalCard.getAttribute("data-backlogo")).toBe("https://cdn.test/mock-brand-back-logo.png");
  });

  describe("Modifier Class Rendering & UI Guards", () => {
    it("should accurately compute BEM modifier classes when isShaking animation flag is active", () => {
      const { container } = render(<GameBoard items={sampleItems} isShaking={true} />);

      const wrapperSection = container.querySelector("section");
      expect(wrapperSection?.className).toContain("game-board--is-shaking");
    });

    it("should successfully emit interaction ids to parent handlers when grid elements are clicked outside readonly state", () => {
      render(<GameBoard items={sampleItems} onItemClick={onItemClickSpy} readonly={false} />);

      const physicalCard = screen.getByTestId("game-card-card-B");
      fireEvent.click(physicalCard);

      expect(onItemClickSpy).toHaveBeenCalledWith("card-B");
    });

    it("should strictly suppress execution events and append a readonly styling modifier when readonly is active", () => {
      const { container } = render(<GameBoard items={sampleItems} onItemClick={onItemClickSpy} readonly={true} />);

      const wrapperSection = container.querySelector("section");
      expect(wrapperSection?.className).toContain("game-board--readonly");

      const physicalCard = screen.getByTestId("game-card-card-A");
      fireEvent.click(physicalCard);

      expect(onItemClickSpy).not.toHaveBeenCalled();
    });
  });
});
