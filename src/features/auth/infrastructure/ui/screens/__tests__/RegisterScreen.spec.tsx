import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { RegisterScreen } from "../RegisterScreen";
import { Result } from "../../../../../../shared/domain/models/Result";

vi.mock("../../../stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("RegisterScreen - Integration Unit Tests", () => {
  let mockRegisterFn: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterFn = vi.fn();

    vi.mocked(useAuthStore).mockReturnValue({
      register: mockRegisterFn,
    });
  });

  it("should mount structurally and render the embedded presentation registration form", () => {
    render(<RegisterScreen />, { wrapper: BrowserRouter });

    expect(screen.getByLabelText(/Nombre/i)).toBeDefined();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Registrarse/i })).toBeDefined();
  });

  it("should delegate execution to auth store and return empty field state upon successful user registration", async () => {
    mockRegisterFn.mockResolvedValue(Result.success(undefined));

    render(<RegisterScreen />, { wrapper: BrowserRouter });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Nombre/i), "Angel");
    await user.type(screen.getByLabelText(/Apellido/i), "Core");
    await user.type(screen.getByLabelText(/Usuario/i), "angel_core");
    await user.type(screen.getByLabelText(/Correo electrónico/i), "angelcore@email.com");
    await user.type(screen.getByLabelText(/^Contraseña/i), "securePassword123");
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), "securePassword123");

    const submitButton = screen.getByRole("button", { name: /Registrarse/i });
    await user.click(submitButton);

    expect(mockRegisterFn).toHaveBeenCalledWith({
      firstName: "Angel",
      lastName: "Core",
      username: "angel_core",
      email: "angelcore@email.com",
      password: "securePassword123",
      confirmPassword: "securePassword123",
    });

    await waitFor(() => {
      expect((screen.getByLabelText(/Usuario/i) as HTMLInputElement).value).toBe("");
      expect((screen.getByLabelText(/Correo electrónico/i) as HTMLInputElement).value).toBe("");
    });
  });

  it("should intercept architecture-level failures and translate them into visible UI global errors", async () => {
    const domainErrorMessage = "El correo electrónico o nombre de usuario ya está asociado con una cuenta existente";

    mockRegisterFn.mockResolvedValue(
      Result.failure({
        error: { message: domainErrorMessage, code: "USER_ALREADY_EXISTS", name: "" },
      }),
    );

    render(<RegisterScreen />, { wrapper: BrowserRouter });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Nombre/i), "Angel");
    await user.type(screen.getByLabelText(/Apellido/i), "Core");
    await user.type(screen.getByLabelText(/Usuario/i), "angel_core");
    await user.type(screen.getByLabelText(/^Contraseña/i), "securePassword123");
    await user.type(screen.getByLabelText(/Confirmar contraseña/i), "securePassword123");

    await user.type(screen.getByLabelText(/Correo electrónico/i), "duplicate@email.com");
    await user.click(screen.getByRole("button", { name: /Registrarse/i }));

    expect(mockRegisterFn).toHaveBeenCalled();

    const alertBanner = await screen.findByText(domainErrorMessage);
    expect(alertBanner).toBeDefined();
  });
});
