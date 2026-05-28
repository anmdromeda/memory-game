import { useAuthStore } from "../../stores/authStore";
import type { RegistrationUserDataPasswordProps } from "../../../domain/models/RegistrationUserData";
import { AuthFormSurface } from "../components/AuthFormSurface";
import {
  RestorePasswordForm,
  type RestorePasswordFormActionState,
} from "../components/RestorePasswordForm/RestorePasswordForm";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { AppRoutesPath } from "../../../../../shared/infrastructure/routes/pahts";
import { ActionMessage } from "../../../../../shared/infrastructure/ui/components/ActionMessage";
import { AUTH_ERRORS_DICT } from "../../errors/dictionary";
import { translateResultError } from "../../../../../shared/infrastructure/utils/errorsTranslation";

export function RestorePasswordScreen() {
  const restorePassword = useAuthStore((state) => state.restorePassword);
  const [searchParams] = useSearchParams();
  const [canBackToLogin, setCanBackToLogin] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get("token") || null;

  async function handleRestorePassword(
    credentials: RegistrationUserDataPasswordProps,
  ): Promise<RestorePasswordFormActionState> {
    const result = await restorePassword({ ...credentials, token: token || "" });

    setCanBackToLogin(result.isSuccess);

    if (!result.isSuccess) {
      return { fields: credentials, errors: { global: translateResultError(result, AUTH_ERRORS_DICT) } };
    }

    return { fields: {}, errors: {} };
  }

  if (!token) {
    return <Navigate to={AppRoutesPath.Auth.Login} replace />;
  }

  return (
    <AuthFormSurface>
      {canBackToLogin ? (
        <ActionMessage
          message="Contraseña actualizada correctamente. Ya puedes Iniciar sesión con tus nuevas credenciales."
          actionLabel="Iniciar sesión"
          onAction={() => navigate(AppRoutesPath.Auth.Login)}
          variant="primary"
          tone="darken"
        />
      ) : (
        <RestorePasswordForm onSubmit={handleRestorePassword} />
      )}
    </AuthFormSurface>
  );
}
