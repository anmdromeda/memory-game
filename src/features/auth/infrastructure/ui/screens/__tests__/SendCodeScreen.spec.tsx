import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";
import { SendCodeScreen } from "../SendCodeScreen";
import { Result } from "../../../../../../shared/domain/models/Result";

vi.mock("../../../stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("SendCodeScreen - Integration Unit Tests", () => {
  let mockSendCodeFn: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendCodeFn = vi.fn();

    vi.mocked(useAuthStore).mockReturnValue(mockSendCodeFn);
  });

  it("should mount structurally and initially display the core presentation form", () => {
    render(<SendCodeScreen />, { wrapper: BrowserRouter });

    expect(screen.getByLabelText(/Correo electrónico/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Enviar código de recuperación/i })).toBeDefined();
  });

  it("should mutate the screen state into a success panel upon correct operation and allow resetting the layout", async () => {
    mockSendCodeFn.mockResolvedValue(Result.success(undefined));

    render(<SendCodeScreen />, { wrapper: BrowserRouter });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Correo electrónico/i), "dev_recovery@email.com");
    await user.click(screen.getByRole("button", { name: /Enviar código de recuperación/i }));

    expect(mockSendCodeFn).toHaveBeenCalledWith({ email: "dev_recovery@email.com" });

    const successMessage = await screen.findByText(/Correo enviado\. Revisa tu bandeja de entrada/i);
    expect(successMessage).toBeDefined();
    expect(screen.queryByLabelText(/Correo electrónico/i)).toBeNull();

    const retryButton = screen.getByRole("button", { name: /Enviar de nuevo/i });
    await user.click(retryButton);

    expect(screen.queryByText(/Correo enviado\. Revisa tu bandeja de entrada/i)).toBeNull();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeDefined();
  });

  it("should keep the presentation form visible and propagate domain breakdown messages on failure", async () => {
    const infrastructureErrorMessage = "An unknown error occurred";

    mockSendCodeFn.mockResolvedValue(
      Result.failure({
        error: { message: infrastructureErrorMessage, code: "QUOTA_EXCEEDED", name: "" },
      }),
    );

    render(<SendCodeScreen />, { wrapper: BrowserRouter });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Correo electrónico/i), "overloaded@email.com");
    await user.click(screen.getByRole("button", { name: /Enviar código de recuperación/i }));

    expect(mockSendCodeFn).toHaveBeenCalled();

    expect(screen.queryByText(/Correo enviado\. Revisa tu bandeja de entrada/i)).toBeNull();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeDefined();

    const errorAlert = await screen.findByText(infrastructureErrorMessage);
    expect(errorAlert).toBeDefined();
  });
});
