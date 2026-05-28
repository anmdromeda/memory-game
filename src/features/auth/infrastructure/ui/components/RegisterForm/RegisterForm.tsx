import { useActionState } from "react";
import { RegistrationUserData, type RegistrationUserDataProps } from "../../../../domain/models/RegistrationUserData";
import { Input } from "../../../../../../shared/infrastructure/ui/components/Input";
import { Button } from "../../../../../../shared/infrastructure/ui/components/Button";
import "./RegisterForm.scss";
import { Alert } from "../../../../../../shared/infrastructure/ui/components/Alert";
import { NavLink } from "react-router-dom";
import { AppRoutesPath } from "../../../../../../shared/infrastructure/routes/pahts";
import PasswordInput from "../PasswordInput/PasswordInput";
import { AUTH_ERRORS_DICT } from "../../../errors/dictionary";
import { translateValidationErrors } from "../../../../../../shared/infrastructure/utils/errorsTranslation";

interface RegisterFormProps {
  onSubmit: (userData: RegistrationUserDataProps) => Promise<RegisterFormActionState>;
}

export interface RegisterFormActionState {
  errors: Partial<RegistrationUserDataProps & { global: string }>;
  fields?: Partial<RegistrationUserDataProps>;
}

const initialState: RegisterFormActionState = {
  errors: {},
  fields: {
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
  },
};

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const handleRegisterAction = async (
    _prevState: RegisterFormActionState,
    formData: FormData,
  ): Promise<RegisterFormActionState> => {
    const data: RegistrationUserDataProps = {
      firstName: (formData.get("firstName") as string) || "",
      lastName: (formData.get("lastName") as string) || "",
      username: (formData.get("username") as string) || "",
      password: (formData.get("password") as string) || "",
      confirmPassword: (formData.get("confirmPassword") as string) || "",
      email: (formData.get("email") as string) || "",
    };

    const validationErrorsCodes = RegistrationUserData.validate(data);

    if (validationErrorsCodes) {
      return {
        errors: translateValidationErrors(validationErrorsCodes, AUTH_ERRORS_DICT),
        fields: data,
      };
    }

    return await onSubmit(data);
  };

  const [state, formAction, isPending] = useActionState(handleRegisterAction, initialState);
  const isFormDisabled = isPending;

  const showGlobalErrorAlert = state.errors.global && !isPending;

  return (
    <form action={formAction} className="register-form">
      {showGlobalErrorAlert ? <Alert severity="error">{state.errors.global}</Alert> : null}

      <div className="register-form__row-two-columns">
        <Input
          label="Nombre"
          name="firstName"
          placeholder=""
          defaultValue={state.fields?.firstName}
          error={state.errors.firstName}
          disabled={isFormDisabled}
        />

        <Input
          label="Apellido"
          name="lastName"
          placeholder=""
          defaultValue={state.fields?.lastName}
          error={state.errors.lastName}
          disabled={isFormDisabled}
        />
      </div>

      <Input
        label="Usuario"
        name="username"
        type="text"
        placeholder=""
        defaultValue={state.fields?.username}
        error={state.errors?.username}
        disabled={isFormDisabled}
      />

      <Input
        label="Correo electrónico"
        name="email"
        type="text"
        placeholder=""
        defaultValue={state.fields?.email}
        error={state.errors?.email}
        disabled={isFormDisabled}
      />

      <PasswordInput
        label="Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        defaultValue={state.fields?.password}
        error={state.errors.password}
        disabled={isFormDisabled}
      />

      <PasswordInput
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        defaultValue={state.fields?.confirmPassword}
        error={state.errors.confirmPassword}
        disabled={isFormDisabled}
      />

      <Button type="submit" isLoading={isPending} label="Registrarse" tone="darken" disabled={isFormDisabled} />

      <NavLink to={AppRoutesPath.Auth.Login} className="form-link">
        ¿Ya tienes cuenta? Inicia sesión
      </NavLink>
    </form>
  );
}
