import { useActionState } from "react";
import { LoginCredentials, type LoginCredentialsProps } from "../../../../domain/models/LoginCredentials";
import { Input } from "../../../../../../shared/infrastructure/ui/components/Input";
import { Button } from "../../../../../../shared/infrastructure/ui/components/Button";
import "./LoginForm.scss";
import { Alert } from "../../../../../../shared/infrastructure/ui/components/Alert";
import { Image } from "../../../../../../shared/infrastructure/ui/components/Image";
import { NavLink } from "react-router-dom";
import { AppRoutesPath } from "../../../../../../shared/infrastructure/routes/pahts";
import PasswordInput from "../PasswordInput/PasswordInput";
import { AUTH_ERRORS_DICT } from "../../../errors/dictionary";
import { translateValidationErrors } from "../../../../../../shared/infrastructure/utils/errorsTranslation";

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentialsProps) => Promise<LoginActionFormState>;
  brandLogoSrc?: string;
}

export interface LoginActionFormState {
  errors: Partial<LoginCredentialsProps & { global: string }>;
  fields: LoginCredentialsProps;
}

const initialState: LoginActionFormState = {
  errors: {},
  fields: {
    username: "",
    password: "",
  },
};

export function LoginForm({ onSubmit, brandLogoSrc }: LoginFormProps) {
  async function handleAction(_prevState: LoginActionFormState, formData: FormData): Promise<LoginActionFormState> {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const credentials: LoginCredentialsProps = { username, password };

    const validationErrors = LoginCredentials.validate(credentials);

    if (validationErrors ) {
      return { errors: translateValidationErrors(validationErrors, AUTH_ERRORS_DICT), fields: credentials };
    }

    return await onSubmit(credentials);
  }

  const [state, formAction, isPending] = useActionState(handleAction, initialState);

  const showGlobalErrorAlert = state.errors.global && !isPending;

  return (
    <div className="login-form-container">
      {brandLogoSrc ? (
        <Image
          width="100%"
          height="100px"
          src={brandLogoSrc}
          alt="Login Form brand logo"
          className="login-form-container__brand-logo"
        />
      ) : null}

      <form action={formAction} className="login-form">
        {showGlobalErrorAlert ? <Alert severity="error">{state.errors.global}</Alert> : null}

        <Input
          label="Usuario"
          name="username"
          type="text"
          placeholder=""
          defaultValue={state.fields.username}
          error={state.errors.username}
          disabled={isPending}
        />

        <PasswordInput
          label="Contraseña"
          name="password"
          type="password"
          placeholder=""
          defaultValue={state.fields.password}
          error={state.errors.password}
          disabled={isPending}
        />

        <Button type="submit" label="Iniciar sesión" isLoading={isPending} disabled={isPending} tone="darken" />

        <NavLink to={AppRoutesPath.Auth.SendCode} className="form-link">
          ¿Olvidaste tu usuario o contraseña?
        </NavLink>

        <NavLink to={AppRoutesPath.Auth.Register} className="form-link">
          ¿No tienes cuenta? Registrate
        </NavLink>
      </form>
    </div>
  );
}
