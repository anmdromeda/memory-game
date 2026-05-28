import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { RestorePasswordScreen } from "../RestorePasswordScreen";
import { Result } from "../../../../../../shared/domain/models/Result";

vi.mock("../../../stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: vi.fn(),
    useNavigate: vi.fn(),
    Navigate: vi.fn(() => <div data-testid="navigate-mock" />),
  };
});

describe("RestorePasswordScreen - Integration Unit Tests", () => {
  let mockRestorePasswordFn: Mock;
  let mockNavigateFn: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRestorePasswordFn = vi.fn();
    mockNavigateFn = vi.fn();

    vi.mocked(useAuthStore).mockReturnValue(mockRestorePasswordFn);
    vi.mocked(useNavigate).mockReturnValue(mockNavigateFn);
  });

  it("should instantly trigger a strict redirection replacement if the transaction token is missing in URL parameters", () => {
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams({}), vi.fn()]);

    render(<RestorePasswordScreen />, { wrapper: BrowserRouter });

    expect(screen.getByTestId("navigate-mock")).toBeDefined();
    expect(screen.queryByLabelText(/^Contraseña/i)).toBeNull();
  });

  it("should successfully render the presentation credentials form if a valid URL token structure is identified", () => {
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams({ token: "secure-jwt-token" }), vi.fn()]);

    render(<RestorePasswordScreen />, { wrapper: BrowserRouter });

    expect(screen.getByLabelText(/^Contraseña/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Restaurar/i })).toBeDefined();
  });

  it("should mutate the screen layout into a success state upon correct password restoration", async () => {
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams({ token: "secure-jwt-token" }), vi.fn()]);
    mockRestorePasswordFn.mockResolvedValue(Result.success(undefined));

    render(<RestorePasswordScreen />, { wrapper: BrowserRouter });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/^Contraseña/i), "newSecurePass123");
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), "newSecurePass123");
    await user.click(screen.getByRole("button", { name: /Restaurar/i }));

    expect(mockRestorePasswordFn).toHaveBeenCalledWith({
      password: "newSecurePass123",
      confirmPassword: "newSecurePass123",
      token: "secure-jwt-token",
    });

    const successMessage = await screen.findByText(/Contraseña actualizada correctamente/i);
    expect(successMessage).toBeDefined();
    expect(screen.queryByLabelText(/^Contraseña/i)).toBeNull();

    const loginRedirectButton = screen.getByRole("button", { name: /Iniciar sesión/i });
    await user.click(loginRedirectButton);

    expect(mockNavigateFn).toHaveBeenCalledWith(expect.any(String));
  });

  it("should keep the form active and let useActionState print errors if the domain execution returns failure", async () => {
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams({ token: "expired-or-bad-token" }), vi.fn()]);
    const backendMessage = "Ocurrió un error inesperado Por favor, inténtalo de nuevo más tarde";

    mockRestorePasswordFn.mockResolvedValue(
      Result.failure({
        error: { message: backendMessage, code: "UNEXPECTED_ERROR", name: "" },
      }),
    );

    render(<RestorePasswordScreen />, { wrapper: BrowserRouter });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/^Contraseña/i), "12345678");
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), "12345678");
    await user.click(screen.getByRole("button", { name: /Restaurar/i }));

    expect(screen.queryByText(/Contraseña actualizada correctamente/i)).toBeNull();
    expect(screen.getByLabelText(/^Contraseña/i)).toBeDefined();

    const errorAlert = await screen.findByText(backendMessage);
    expect(errorAlert).toBeDefined();
  });
});
