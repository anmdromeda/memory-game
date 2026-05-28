import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useSessionStore } from "../../../shared/infrastructure/stores/userSession";
import { RootLayout } from "../RootLayout";

vi.mock("../../../shared/infrastructure/stores/userSession", () => ({
  useSessionStore: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  Outlet: vi.fn(() => <div data-testid="router-outlet">Nested Route Content</div>),
}));

vi.mock("../../../shared/infrastructure/ui/components/Navbar", () => ({
  Navbar: vi.fn(({ title, brandLogoSrc, brandDisplayName }) => (
    <nav data-testid="ui-navbar">
      <h1>{title}</h1>
      <img src={brandLogoSrc} alt="logo-test" />
      <span>{brandDisplayName}</span>
    </nav>
  )),
}));

vi.mock("../../../shared/infrastructure/ui/components/Layout", () => ({
  Layout: vi.fn(({ navbar, children }) => (
    <div data-testid="ui-layout">
      <header data-testid="layout-header">{navbar}</header>
      <main data-testid="layout-main">{children}</main>
    </div>
  )),
}));

describe("RootLayout - Core Application Shell Integration Tests", () => {
  const mockTheme = {
    displayName: "Vanilla Sky Dark",
    tokens: {
      app: {
        brandLogo: "https://cdn.memgame.com/logos/vanilla-dark.png",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should mount Navbar with exact theme tokens when user session is fully authenticated", () => {
    vi.mocked(useSessionStore).mockImplementation((selector: CallableFunction) =>
      selector({
        isAuthenticated: true,
        theme: mockTheme,
      }),
    );

    render(<RootLayout />);

    expect(screen.getByTestId("ui-layout")).toBeDefined();
    expect(screen.getByTestId("ui-navbar")).toBeDefined();
    expect(screen.getByText("Juego de memoria")).toBeDefined();

    const logoImg = screen.getByRole("img", { name: "logo-test" });
    expect(logoImg.getAttribute("src")).toBe("https://cdn.memgame.com/logos/vanilla-dark.png");
    expect(screen.getByText("Vanilla Sky Dark")).toBeDefined();

    expect(screen.getByTestId("router-outlet")).toBeDefined();
  });

  it("should omit Navbar embedding when user context is unauthenticated", () => {
    vi.mocked(useSessionStore).mockImplementation((selector: CallableFunction) =>
      selector({
        isAuthenticated: false,
        theme: mockTheme,
      }),
    );

    render(<RootLayout />);

    expect(screen.getByTestId("ui-layout")).toBeDefined();
    expect(screen.queryByTestId("ui-navbar")).toBeNull();
    expect(screen.getByTestId("router-outlet")).toBeDefined();
  });
});
