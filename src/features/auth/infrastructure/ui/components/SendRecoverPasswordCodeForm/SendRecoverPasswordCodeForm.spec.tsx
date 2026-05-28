import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import {
  SendRecoverPasswordCodeForm,
  type SendRecoverPasswordCodeFormActionState,
} from "./SendRecoverPasswordCodeForm";
import { EmailValidator } from "../../../../domain/utils/emailValidator";
import type { SendRecoverPasswordCodeInput } from "../../../../application/SendRecoverPasswordCodeUseCase";

vi.mock("../../../../domain/utils/emailValidator", () => ({
  EmailValidator: {
    validate: vi.fn(),
  },
}));

describe("SendRecoverPasswordCodeForm - Component Unit Tests", () => {
  let mockOnSubmit: (credentials: SendRecoverPasswordCodeInput) => Promise<SendRecoverPasswordCodeFormActionState>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit = vi.fn();
  });

  describe("Rendering", () => {
    it("should structurally render the email input utility, submission key, and redirection anchor", () => {
      render(<SendRecoverPasswordCodeForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });

      expect(screen.getByLabelText(/Correo electrónico/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Enviar código de recuperación/i })).toBeDefined();
      expect(screen.getByRole("link", { name: /Volver al inicio/i })).toBeDefined();
    });
  });

  describe("Form Submissions & Interaction Flow", () => {
    it("should intercept early submission and render local validation constraints if email policies fail", async () => {
      vi.mocked(EmailValidator.validate).mockReturnValue({
        email: "Invalid email format.",
      });

      render(<SendRecoverPasswordCodeForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });
      const user = userEvent.setup();

      const submitButton = screen.getByRole("button", { name: /Enviar código de recuperación/i });
      await user.click(submitButton);

      expect(EmailValidator.validate).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should securely delegate cleaned payload data to the onSubmit pipeline when parameters match constraints", async () => {
      vi.mocked(EmailValidator.validate).mockReturnValue(null);
      vi.mocked(mockOnSubmit).mockResolvedValue({ errors: {}, fields: { email: "recovery_test@email.com" } });

      render(<SendRecoverPasswordCodeForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });
      const user = userEvent.setup();

      const emailInput = screen.getByLabelText(/Correo electrónico/i);
      await user.type(emailInput, "recovery_test@email.com");

      const submitButton = screen.getByRole("button", { name: /Enviar código de recuperación/i });
      await user.click(submitButton);

      expect(EmailValidator.validate).toHaveBeenCalledWith("recovery_test@email.com");
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: "recovery_test@email.com",
      });
    });

    it("should render a global failure alert component if the submitted action state contains server errors", async () => {
      vi.mocked(EmailValidator.validate).mockReturnValue(null);

      vi.mocked(mockOnSubmit).mockResolvedValue({
        errors: { global: "No user account was found associated with this email address." },
        fields: { email: "notfound@email.com" },
      });

      render(<SendRecoverPasswordCodeForm onSubmit={mockOnSubmit} />, { wrapper: BrowserRouter });
      const user = userEvent.setup();

      await user.type(screen.getByLabelText(/Correo electrónico/i), "notfound@email.com");
      await user.click(screen.getByRole("button", { name: /Enviar código de recuperación/i }));

      const alertBanner = await screen.findByText("No user account was found associated with this email address.");
      expect(alertBanner).toBeDefined();
    });
  });
});
