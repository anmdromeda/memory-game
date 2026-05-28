import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthFormSurface } from "./AuthFormSurface";

describe("AuthFormSurface - Presentational Component Unit Tests", () => {
  it("should successfully render its nested children components", () => {
    render(
      <AuthFormSurface>
        <form data-testid="mock-form">
          <input type="text" placeholder="Username" />
        </form>
      </AuthFormSurface>,
    );

    const childForm = screen.getByTestId("mock-form");
    expect(childForm).toBeDefined();
    expect(screen.getByPlaceholderText("Username")).toBeDefined();
  });

  it("should append the custom theme styling class to the structural surface wrapper", () => {
    render(
      <AuthFormSurface>
        <div>Content</div>
      </AuthFormSurface>,
    );

    const textElement = screen.getByText("Content");

    const surfaceElement = textElement.parentElement;

    expect(surfaceElement?.className).toContain("auth-form-surface");
  });
});
