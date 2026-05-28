import { useActionState } from "react";
import { Input } from "../../../../../../shared/infrastructure/ui/components/Input";
import { Button } from "../../../../../../shared/infrastructure/ui/components/Button";
import "./SendRecoverPasswordCodeForm.scss";
import { Alert } from "../../../../../../shared/infrastructure/ui/components/Alert";
import type { SendRecoverPasswordCodeInput } from "../../../../application/SendRecoverPasswordCodeUseCase";
import { EmailValidator } from "../../../../domain/utils/emailValidator";
import { NavLink } from "react-router-dom";
import { AppRoutesPath } from "../../../../../../shared/infrastructure/routes/pahts";
import { AUTH_ERRORS_DICT } from "../../../errors/dictionary";
import { translateValidationErrors } from "../../../../../../shared/infrastructure/utils/errorsTranslation";

export interface SendRecoverPasswordCodeFormProps {
  onSubmit: (credentials: SendRecoverPasswordCodeInput) => Promise<SendRecoverPasswordCodeFormActionState>;
}

export interface SendRecoverPasswordCodeFormActionState {
  errors: Partial<SendRecoverPasswordCodeInput & { global: string }>;
  fields: SendRecoverPasswordCodeInput;
}

const initialState: SendRecoverPasswordCodeFormActionState = {
  errors: {},
  fields: {
    email: "",
  },
};

export function SendRecoverPasswordCodeForm({ onSubmit }: SendRecoverPasswordCodeFormProps) {
  async function handleAction(
    _prevState: SendRecoverPasswordCodeFormActionState,
    formData: FormData,
  ): Promise<SendRecoverPasswordCodeFormActionState> {
    const email = formData.get("email") as string;
    const credentials: SendRecoverPasswordCodeInput = { email };

    const validationErrors = EmailValidator.validate(credentials.email);

    if (validationErrors) {
      return { errors: translateValidationErrors(validationErrors, AUTH_ERRORS_DICT), fields: credentials };
    }

    return await onSubmit(credentials);
  }

  const [state, formAction, isPending] = useActionState(handleAction, initialState);

  const showGlobalErrorAlert = state.errors.global && !isPending;

  return (
    <form action={formAction} className="send-recover-password-code-form">
      {showGlobalErrorAlert ? <Alert severity="error">{state.errors.global}</Alert> : null}

      <Input
        label="Correo electrónico"
        name="email"
        type="text"
        placeholder=""
        defaultValue={state.fields.email}
        error={state.errors.email}
        disabled={isPending}
      />

      <Button
        type="submit"
        label="Enviar código de recuperación"
        isLoading={isPending}
        disabled={isPending}
        tone="darken"
      />

      <NavLink to={AppRoutesPath.Auth.Login} className="form-link">
        Volver al inicio
      </NavLink>
    </form>
  );
}
