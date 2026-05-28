import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { useSessionStore } from "../../../../../../shared/infrastructure/stores/userSession";
import { LoginScreen } from "../LoginScreen";
import { Result } from "../../../../../../shared/domain/models/Result";

vi.mock("../../../stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("../../../../../../shared/infrastructure/stores/userSession", () => ({
  useSessionStore: vi.fn(),
}));

describe("LoginScreen - Integration Unit Tests", () => {
  let mockLoginFn: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginFn = vi.fn();

    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLoginFn,
    });

    vi.mocked(useSessionStore).mockImplementation((selector: CallableFunction) =>
      selector({
        theme: {
          tokens: {
            app: { brandLogo: "https://cdn.test/brand-logo.png" },
          },
        },
      }),
    );
  });

  it("should successfully mount the layout injecting the infrastructure store brand logo token", () => {
    render(<LoginScreen />, { wrapper: BrowserRouter });

    const logoImage = screen.getByAltText("Login Form brand logo") as HTMLImageElement;
    expect(logoImage.src).toBe("https://cdn.test/brand-logo.png");
  });

  it("should delegate execution to auth store and keep form fields clear upon successful login dispatch", async () => {
    mockLoginFn.mockResolvedValue(Result.success(undefined));

    render(<LoginScreen />, { wrapper: BrowserRouter });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Usuario/i), "angel_dev");
    await user.type(screen.getByLabelText(/Contraseña/i), "password123");
    await user.click(screen.getByRole("button", { name: /Iniciar sesión/i }));

    expect(mockLoginFn).toHaveBeenCalledWith({
      username: "angel_dev",
      password: "password123",
    });

    await waitFor(() => {
      expect((screen.getByLabelText(/Usuario/i) as HTMLInputElement).value).toBe("");
      expect((screen.getByLabelText(/Contraseña/i) as HTMLInputElement).value).toBe("");
    });
  });

  it("should catch domain errors returned from the store execution and propagate them to the view alert sub-tree", async () => {
    const backendErrorMessage = "Los datos de acceso son incorrectos.";

    mockLoginFn.mockResolvedValue(
      Result.failure({
        error: { message: backendErrorMessage, code: "INVALID_CREDENTIALS", name: "" },
      }),
    );

    render(<LoginScreen />, { wrapper: BrowserRouter });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Usuario/i), "brute_force_user");
    await user.type(screen.getByLabelText(/Contraseña/i), "wrong_password");
    await user.click(screen.getByRole("button", { name: /Iniciar sesión/i }));

    expect(mockLoginFn).toHaveBeenCalled();

    const alertBanner = await screen.findByText(backendErrorMessage);
    expect(alertBanner).toBeDefined();
  });
});
