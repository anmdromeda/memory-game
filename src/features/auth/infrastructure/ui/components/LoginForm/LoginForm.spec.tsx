import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { LoginForm, type LoginActionFormState } from "./LoginForm";
import { LoginCredentials, type LoginCredentialsProps } from "../../../../domain/models/LoginCredentials";

vi.mock("../../../../domain/models/LoginCredentials", () => ({
  LoginCredentials: {
    validate: vi.fn(),
  },
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe("LoginForm - Component Unit Tests", () => {
  let mockOnSubmit: (credentials: LoginCredentialsProps) => Promise<LoginActionFormState>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit = vi.fn();
  });

  describe("Rendering", () => {
    it("should display the brand logo image only if the source property is explicitly supplied", () => {
      const { rerender } = render(<LoginForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });

      expect(screen.queryByAltText("Login Form brand logo")).toBeNull();

      rerender(<LoginForm onSubmit={mockOnSubmit} brandLogoSrc="https://test.com/logo.png" />);

      expect(screen.getByAltText("Login Form brand logo")).toBeDefined();
    });

    it("should structurally render all essential input utilities and action keys", () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/Usuario/i)).toBeDefined();
      expect(screen.getByLabelText(/Contraseña/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Iniciar sesión/i })).toBeDefined();
    });
  });

  describe("Form Submissions & Interaction Flow", () => {
    it("should intercept early submission and render local domain boundary validation constraints", async () => {
      vi.mocked(LoginCredentials.validate).mockReturnValue({
        username: "The username is required.",
        password: "",
      });

      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} />);
      const user = userEvent.setup();

      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });
      await user.click(submitButton);

      expect(LoginCredentials.validate).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should securely delegate credentials data to the onSubmit prop pipeline when values are valid", async () => {
      vi.mocked(LoginCredentials.validate).mockReturnValue(null);
      vi.mocked(mockOnSubmit).mockResolvedValue({ errors: {}, fields: { username: "angel_dev", password: "123" } });

      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} />);
      const user = userEvent.setup();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      const submitButton = screen.getByRole("button", { name: /Iniciar sesión/i });

      await user.type(usernameInput, "angel_dev");
      await user.type(passwordInput, "correctPassword123");
      await user.click(submitButton);

      expect(LoginCredentials.validate).toHaveBeenCalledWith({
        username: "angel_dev",
        password: "correctPassword123",
      });
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: "angel_dev",
        password: "correctPassword123",
      });
    });

    it("should render a global failure alert component if the submitted action state contains global errors", async () => {
      vi.mocked(LoginCredentials.validate).mockReturnValue(null);

      vi.mocked(mockOnSubmit).mockResolvedValue({
        errors: { global: "Invalid username or password credentials." },
        fields: { username: "wrong_user", password: "123" },
      });

      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} />);
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/Usuario/i), "wrong_user");
      await user.type(screen.getByLabelText(/Contraseña/i), "123");
      await user.click(screen.getByRole("button", { name: /Iniciar sesión/i }));

      const alertMessage = await screen.findByText("Invalid username or password credentials.");
      expect(alertMessage).toBeDefined();
    });
  });
});
