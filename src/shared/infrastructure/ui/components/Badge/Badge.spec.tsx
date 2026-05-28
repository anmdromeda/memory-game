import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Badge } from "./Badge";

describe("Badge - Presentational Component Unit Tests", () => {
  it("should structurally render its inner text content injected into the layout", () => {
    render(<Badge>Beta</Badge>);

    expect(screen.getByText("Beta")).toBeDefined();
  });

  it("should dynamically assemble styling variant classes following BEM standards via computedClassNames", () => {
    const { container, rerender } = render(
      <Badge variant="secondary" size="sm">
        New
      </Badge>,
    );

    let rootNode = container.firstChild as HTMLElement;
    expect(rootNode.className).toContain("badge");
    expect(rootNode.className).toContain("badge--secondary");
    expect(rootNode.className).toContain("badge--sm");

    rerender(
      <Badge variant="container" size="lg" className="custom-context">
        New
      </Badge>,
    );

    rootNode = container.firstChild as HTMLElement;
    expect(rootNode.className).toContain("badge");
    expect(rootNode.className).toContain("badge--container");
    expect(rootNode.className).toContain("badge--lg");
    expect(rootNode.className).toContain("custom-context");
  });

  it("should securely transparently forward native HTML props down to the root DOM wrapper container", async () => {
    const mockOnClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Badge id="experimental-badge" data-testid="badge-wrapper" onClick={mockOnClick} style={{ marginTop: "10px" }}>
        Clickable
      </Badge>,
    );

    const badgeElement = screen.getByTestId("badge-wrapper");

    expect(badgeElement.id).toBe("experimental-badge");
    expect(badgeElement.style.marginTop).toBe("10px");

    await user.click(badgeElement);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
