import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAuthStore } from "../../../features/auth/infrastructure/stores/authStore";
import { AppRouter } from "../AppRouter";

const defaultSuccessResult = {
  isSuccess: true,
  getValue: () => ({ id: "router-user", username: "router_king" }),
};

vi.mock("../../features/auth/application/RetrieveUserInfoUseCase", () => ({
  RetrieveUserInfoUseCase: class {
    execute = vi.fn().mockResolvedValue(defaultSuccessResult);
  },
}));

vi.mock("../../features/auth/application/LoginUseCase", () => ({
  LoginUseCase: class {
    execute = vi.fn();
  },
}));

vi.mock("../../features/auth/application/RegisterUseCase", () => ({
  RegisterUseCase: class {
    execute = vi.fn();
  },
}));

vi.mock("../../features/auth/application/LogoutUseCase", () => ({
  LogoutUseCase: class {
    execute = vi.fn();
  },
}));

vi.mock("../../shared/infrastructure/ui/components/SplashScreen", () => ({
  SplashScreen: vi.fn(() => <div data-testid="splash-screen">Splash Screen Active</div>),
}));

vi.mock("../../features/game-play/infrastructure/ui/screens/GameScreen", () => ({
  GameScreen: vi.fn(() => <div data-testid="game-screen">Game Play Dashboard Mounted</div>),
}));

vi.mock("../../features/auth/infrastructure/ui/screens/LoginScreen", () => ({
  LoginScreen: vi.fn(() => <div data-testid="login-screen">Login Screen Mounted</div>),
}));

vi.mock("./Guards", () => ({
  ProtectedRoute: vi.fn(() => (
    <div data-testid="protected-outlet">
      <span data-testid="nested-view"></span>
    </div>
  )),

  PublicRoute: vi.fn(() => (
    <div data-testid="public-outlet">
      <span data-testid="nested-view"></span>
    </div>
  )),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    RouterProvider: vi.fn(() => {
      return <div data-testid="router-provider-root">Router Initialized Safely</div>;
    }),
  };
});

describe("AppRouter - Navigation Orchestrator Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Session Rehydration Lifecycle (retrievingUser)", () => {
    it("should mount the SplashScreen fallback and halt core routing while rehydrating user context", () => {
      useAuthStore.setState({
        retrievingUser: true,
      });

      render(<AppRouter />);
      expect(screen.getByTestId("splash-screen")).toBeDefined();
      expect(screen.queryByTestId("router-provider-root")).toBeNull();
    });

    it("should smoothly teardown the SplashScreen and release the RouterProvider once background resolution completes", () => {
      useAuthStore.setState({
        retrievingUser: false,
      });

      render(<AppRouter />);

      expect(screen.queryByTestId("splash-screen")).toBeNull();
      expect(screen.getByTestId("router-provider-root")).toBeDefined();
    });
  });
});
