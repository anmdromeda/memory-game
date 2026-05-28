import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { RegisterForm, type RegisterFormActionState } from "./RegisterForm";
import { RegistrationUserData, type RegistrationUserDataProps } from "../../../../domain/models/RegistrationUserData";

vi.mock("../../../../domain/models/RegistrationUserData", () => ({
  RegistrationUserData: {
    validate: vi.fn(),
  },
}));

describe("RegisterForm - Component Unit Tests", () => {
  let mockOnSubmit: (userData: RegistrationUserDataProps) => Promise<RegisterFormActionState>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit = vi.fn();
  });

  describe("Rendering", () => {
    it("should structurally render all essential input fields, password verification fields, and the action button", () => {
      render(<RegisterForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });

      expect(screen.getByLabelText(/Nombre/i)).toBeDefined();
      expect(screen.getByLabelText(/Apellido/i)).toBeDefined();
      expect(screen.getByLabelText(/Usuario/i)).toBeDefined();
      expect(screen.getByLabelText(/Correo electrónico/i)).toBeDefined();
      expect(screen.getByLabelText(/^Contraseña/i)).toBeDefined(); // RegExp para evitar ambigüedad con confirmar
      expect(screen.getByLabelText(/Confirmar contraseña/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Registrarse/i })).toBeDefined();
    });
  });

  describe("Form Submissions & Form Action Pipeline", () => {
    it("should intercept early submission and render local validation constraints if domain rules fail", async () => {
      vi.mocked(RegistrationUserData.validate).mockReturnValue({
        username: "The username is required.",
        email: "Invalid email format.",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
      });

      render(<RegisterForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });
      const user = userEvent.setup();

      const submitButton = screen.getByRole("button", { name: /Registrarse/i });
      await user.click(submitButton);

      expect(RegistrationUserData.validate).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should securely delegate sanitized registration data to the onSubmit prop pipeline when input values pass guards", async () => {
      vi.mocked(RegistrationUserData.validate).mockReturnValue(null);

      vi.mocked(mockOnSubmit).mockResolvedValue({ errors: {} });

      render(<RegisterForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/Nombre/i), "Angel");
      await user.type(screen.getByLabelText(/Apellido/i), "Core");
      await user.type(screen.getByLabelText(/Usuario/i), "angel_core");
      await user.type(screen.getByLabelText(/Correo electrónico/i), "angelcore@email.com");
      await user.type(screen.getByLabelText(/^Contraseña/i), "securePassword123");
      await user.type(screen.getByLabelText(/Confirmar contraseña/i), "securePassword123");

      const submitButton = screen.getByRole("button", { name: /Registrarse/i });
      await user.click(submitButton);

      expect(RegistrationUserData.validate).toHaveBeenCalledWith({
        firstName: "Angel",
        lastName: "Core",
        username: "angel_core",
        email: "angelcore@email.com",
        password: "securePassword123",
        confirmPassword: "securePassword123",
      });

      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: "Angel",
        lastName: "Core",
        username: "angel_core",
        email: "angelcore@email.com",
        password: "securePassword123",
        confirmPassword: "securePassword123",
      });
    });

    it("should render a global failure alert banner if the action state resolution returns a global error key", async () => {
      vi.mocked(RegistrationUserData.validate).mockReturnValue(null);

      vi.mocked(mockOnSubmit).mockResolvedValue({
        errors: { global: "Email account is already registered in our system." },
        fields: { firstName: "Angel", lastName: "Core", email: "dup@email.com" },
      });

      render(<RegisterForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/Correo electrónico/i), "dup@email.com");
      await user.click(screen.getByRole("button", { name: /Registrarse/i }));

      const globalAlert = await screen.findByText("Email account is already registered in our system.");
      expect(globalAlert).toBeDefined();
    });
  });
});
