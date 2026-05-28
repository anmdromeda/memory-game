import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionMessage } from "./ActionMessage";

describe("ActionMessage - Presentational Component Unit Tests", () => {
  it("should structurally render the message description and the actionable button label", () => {
    const mockOnAction = vi.fn();

    render(
      <ActionMessage
        message="Your session has expired. Please authenticate again."
        actionLabel="Re-authenticate"
        onAction={mockOnAction}
      />,
    );

    expect(screen.getByText("Your session has expired. Please authenticate again.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Re-authenticate" })).toBeDefined();
  });

  it("should delegate execution to the onAction callback pipeline when the action button is clicked", async () => {
    const mockOnAction = vi.fn();
    const user = userEvent.setup();

    render(
      <ActionMessage
        message="A verification link was dispatched."
        actionLabel="Resend email"
        onAction={mockOnAction}
      />,
    );

    const actionButton = screen.getByRole("button", { name: "Resend email" });
    await user.click(actionButton);

    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it("should successfully append utility and design token class names onto the layout wrapper container", () => {
    const mockOnAction = vi.fn();

    const { container } = render(
      <ActionMessage
        message="Custom themed layout text"
        actionLabel="Action"
        onAction={mockOnAction}
        className="custom-modifier-class-from-parent"
      />,
    );

    const rootContainer = container.firstChild as HTMLElement;

    expect(rootContainer.className).toContain("action-message");
    expect(rootContainer.className).toContain("custom-modifier-class-from-parent");
  });
});
