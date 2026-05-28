import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PasswordInput from "./PasswordInput";

describe("PasswordInput - Component Unit Tests", () => {
  it("should initialize as a masked password input and toggle visibility on icon interaction", async () => {
    render(<PasswordInput label="Contraseña" name="password" defaultValue="secret123" />);

    const user = userEvent.setup();

    const inputElement = screen.getByLabelText(/Contraseña/i) as HTMLInputElement;
    expect(inputElement.type).toBe("password");
    expect(inputElement.value).toBe("secret123");

    const toggleButton = screen.getByRole("button");
    await user.click(toggleButton);

    expect(inputElement.type).toBe("text");

    await user.click(toggleButton);
    expect(inputElement.type).toBe("password");
  });

  it("should cleanly forward structural properties like disabled and error states down to the base input", () => {
    render(<PasswordInput label="Contraseña" name="password" disabled={true} error="Password is too short" />);

    const inputElement = screen.getByLabelText(/Contraseña/i) as HTMLInputElement;

    expect(inputElement.disabled).toBe(true);

    expect(screen.getByText("Password is too short")).toBeDefined();
  });
});
