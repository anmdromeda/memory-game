import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";

describe("Navbar - Presentational Component Unit Tests", () => {
  it("should structurally render the navbar layout and pass the title text down to the inner Badge component", () => {
    render(<Navbar title="Dashboard Alpha" />);

    expect(screen.getByText("Dashboard Alpha")).toBeDefined();

    expect(screen.getByRole("navigation")).toBeDefined();
  });

  it("should conditionally render the brand logo image only when its source property is explicitly supplied", () => {
    const { rerender } = render(<Navbar title="Production Core" />);

    expect(screen.queryByAltText("Navbar brand logo")).toBeNull();

    rerender(<Navbar title="Production Core" brandLogoSrc="https://cdn.test/navbar-brand-logo.png" />);

    const logoElement = screen.getByAltText("Navbar brand logo") as HTMLImageElement;
    expect(logoElement).toBeDefined();
    expect(logoElement.src).toBe("https://cdn.test/navbar-brand-logo.png");
  });

  describe("Brand Display Name Conditonal Rendering", () => {
    it("should not display the brand name heading if showBrandDisplayName is unprovided or false", () => {
      render(<Navbar title="Overview" brandDisplayName="Hexagonal Corp" showBrandDisplayName={false} />);

      expect(screen.queryByText("Hexagonal Corp")).toBeNull();
    });

    it("should successfully render the custom brand typography layout when showBrandDisplayName is true", () => {
      render(<Navbar title="Overview" brandDisplayName="Clean Architecture Core" showBrandDisplayName={true} />);

      const brandHeading = screen.getByText("Clean Architecture Core");
      expect(brandHeading).toBeDefined();

      expect(brandHeading.className).toContain("navbar__brand-display-name");
    });
  });
});
