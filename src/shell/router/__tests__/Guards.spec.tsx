import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { ProtectedRoute, PublicRoute } from "../Guards";
import { useSessionStore } from "../../../shared/infrastructure/stores/userSession";

vi.mock("../../../shared/infrastructure/stores/userSession", () => ({
  useSessionStore: vi.fn(),
}));

vi.mock("../../../shared/infrastructure/routes/pahts", () => ({
  AppRoutesPath: {
    Auth: {
      Login: "/auth/login-fallback",
    },
    GamePlay: {
      Dashboard: "/game/dashboard-fallback",
    },
  },
}));

describe("Navigation Guards - Security Firewall Routing Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderGuardInContext = (GuardComponent: React.ComponentType) => {
    return render(
      <MemoryRouter initialEntries={["/target-route"]}>
        <Routes>
          <Route element={<GuardComponent />}>
            <Route path="/target-route" element={<div data-testid="child-outlet">Access Granted</div>} />
          </Route>
          <Route path="/auth/login-fallback" element={<div data-testid="login-redirect">Redirected to Login</div>} />
          <Route
            path="/game/dashboard-fallback"
            element={<div data-testid="dashboard-redirect">Redirected to Dashboard</div>}
          />
        </Routes>
      </MemoryRouter>,
    );
  };

  describe("ProtectedRoute Guard Verification", () => {
    it("should securely allow rendering of inner Outlet children when user is successfully authenticated", () => {
      vi.mocked(useSessionStore).mockImplementation((selector: CallableFunction) =>
        selector({ isAuthenticated: true }),
      );

      renderGuardInContext(ProtectedRoute);

      expect(screen.getByTestId("child-outlet")).toBeDefined();
      expect(screen.queryByTestId("login-redirect")).toBeNull();
    });

    it("should strictly intercept navigation and force replace-redirect towards Login path if unauthenticated", () => {
      vi.mocked(useSessionStore).mockImplementation((selector: CallableFunction) =>
        selector({ isAuthenticated: false }),
      );

      renderGuardInContext(ProtectedRoute);

      expect(screen.queryByTestId("child-outlet")).toBeNull();
      expect(screen.getByTestId("login-redirect")).toBeDefined();
    });
  });

  describe("PublicRoute Guard Verification", () => {
    it("should gracefully authorize access to guest entry forms when user session does not exist", () => {
      vi.mocked(useSessionStore).mockImplementation((selector: CallableFunction) =>
        selector({ isAuthenticated: false }),
      );

      renderGuardInContext(PublicRoute);

      expect(screen.getByTestId("child-outlet")).toBeDefined();
      expect(screen.queryByTestId("dashboard-redirect")).toBeNull();
    });

    it("should bounce back logged-in users towards the Game Dashboard loop if they try to touch anonymous views", () => {
      vi.mocked(useSessionStore).mockImplementation((selector: CallableFunction) =>
        selector({ isAuthenticated: true }),
      );

      renderGuardInContext(PublicRoute);

      expect(screen.queryByTestId("child-outlet")).toBeNull();
      expect(screen.getByTestId("dashboard-redirect")).toBeDefined();
    });
  });
});
