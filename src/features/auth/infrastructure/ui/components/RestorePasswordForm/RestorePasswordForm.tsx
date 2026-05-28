import { useActionState } from "react";
import { type RegistrationUserDataPasswordProps } from "../../../../domain/models/RegistrationUserData";
import { Button } from "../../../../../../shared/infrastructure/ui/components/Button";
import "./RestorePasswordForm.scss";
import { Alert } from "../../../../../../shared/infrastructure/ui/components/Alert";
import { PasswordValidator } from "../../../../domain/utils/passwordValidator";
import { NavLink } from "react-router-dom";
import { AppRoutesPath } from "../../../../../../shared/infrastructure/routes/pahts";
import PasswordInput from "../PasswordInput/PasswordInput";
import { AUTH_ERRORS_DICT } from "../../../errors/dictionary";
import { translateValidationErrors } from "../../../../../../shared/infrastructure/utils/errorsTranslation";

interface RestorePasswordFormProps {
  onSubmit: (userData: RegistrationUserDataPasswordProps) => Promise<RestorePasswordFormActionState>;
}

export interface RestorePasswordFormActionState {
  errors: Partial<RegistrationUserDataPasswordProps & { global: string }>;
  fields?: Partial<RegistrationUserDataPasswordProps>;
}

const initialState: RestorePasswordFormActionState = {
  errors: {},
  fields: {
    password: "",
    confirmPassword: "",
  },
};

export function RestorePasswordForm({ onSubmit }: RestorePasswordFormProps) {
  const handleRegisterAction = async (
    _prevState: RestorePasswordFormActionState,
    formData: FormData,
  ): Promise<RestorePasswordFormActionState> => {
    const data: RegistrationUserDataPasswordProps = {
      password: (formData.get("password") as string) || "",
      confirmPassword: (formData.get("confirmPassword") as string) || "",
    };

    const validationErrors = PasswordValidator.validate(data);

    if (validationErrors) {
      return {
        errors: translateValidationErrors(validationErrors, AUTH_ERRORS_DICT),
        fields: data,
      };
    }

    return await onSubmit(data);
  };

  const [state, formAction, isPending] = useActionState(handleRegisterAction, initialState);
  const showGlobalErrorAlert = state.errors.global && !isPending;

  return (
    <form action={formAction} className="restore-password-form">
      {showGlobalErrorAlert ? <Alert severity="error">{state.errors.global}</Alert> : null}

      <PasswordInput
        label="Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        defaultValue={state.fields?.password}
        error={state.errors.password}
        disabled={isPending}
      />

      <PasswordInput
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        defaultValue={state.fields?.confirmPassword}
        error={state.errors.confirmPassword}
        disabled={isPending}
      />

      <Button type="submit" isLoading={isPending} label="Restaurar" tone="darken" disabled={isPending} />

      {showGlobalErrorAlert ? (
        <NavLink to={AppRoutesPath.Auth.Login} className="form-link">
          Volver al inicio
        </NavLink>
      ) : null}
    </form>
  );
}
