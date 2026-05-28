import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { RestorePasswordForm, type RestorePasswordFormActionState } from "./RestorePasswordForm";
import { PasswordValidator } from "../../../../domain/utils/passwordValidator";
import type { RegistrationUserDataPasswordProps } from "../../../../domain/models/RegistrationUserData";

vi.mock("../../../../domain/utils/passwordValidator", () => ({
  PasswordValidator: {
    validate: vi.fn(),
  },
}));

describe("RestorePasswordForm - Component Unit Tests", () => {
  let mockOnSubmit: (userData: RegistrationUserDataPasswordProps) => Promise<RestorePasswordFormActionState>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit = vi.fn();
  });

  describe("Rendering", () => {
    it("should structurally render password input fields and the submission action key", () => {
      render(<RestorePasswordForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });

      expect(screen.getByLabelText(/^Contraseña/i)).toBeDefined();
      expect(screen.getByLabelText(/Confirmar contraseña/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Restaurar/i })).toBeDefined();
    });

    it("should not display the recovery redirection link unless a global submission failure occurs", () => {
      render(<RestorePasswordForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });

      expect(screen.queryByRole("link", { name: /Volver al inicio/i })).toBeNull();
    });
  });

  describe("Form Submissions & Interaction Flow", () => {
    it("should intercept early submission and render local validation constraints if password policies fail", async () => {
      vi.mocked(PasswordValidator.validate).mockReturnValue({
        confirmPassword: "Passwords do not match",
      });

      render(<RestorePasswordForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });
      const user = userEvent.setup();

      const submitButton = screen.getByRole("button", { name: /Restaurar/i });
      await user.click(submitButton);

      expect(PasswordValidator.validate).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should securely delegate input parameters to the onSubmit pipeline when data matches policies", async () => {
      vi.mocked(PasswordValidator.validate).mockReturnValue(null);
      vi.mocked(mockOnSubmit).mockResolvedValue({ errors: {} });

      render(<RestorePasswordForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/^Contraseña/i), "newSecurePassword123");
      await user.type(screen.getByLabelText(/Confirmar contraseña/i), "newSecurePassword123");

      const submitButton = screen.getByRole("button", { name: /Restaurar/i });
      await user.click(submitButton);

      expect(PasswordValidator.validate).toHaveBeenCalledWith({
        password: "newSecurePassword123",
        confirmPassword: "newSecurePassword123",
      });
      expect(mockOnSubmit).toHaveBeenCalledWith({
        password: "newSecurePassword123",
        confirmPassword: "newSecurePassword123",
      });
    });

    it("should render global failure alerts and display the redirection shortcut fallback on rejection", async () => {
      vi.mocked(PasswordValidator.validate).mockReturnValue(null);

      vi.mocked(mockOnSubmit).mockResolvedValue({
        errors: { global: "The recovery token has expired. Please request a new link." },
        fields: { password: "123", confirmPassword: "123" },
      });

      render(<RestorePasswordForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/^Contraseña/i), "123");
      await user.click(screen.getByRole("button", { name: /Restaurar/i }));

      const alertBanner = await screen.findByText("The recovery token has expired. Please request a new link.");
      expect(alertBanner).toBeDefined();

      const redirectLink = screen.getByRole("link", { name: /Volver al inicio/i });
      expect(redirectLink).toBeDefined();
    });
  });
});
