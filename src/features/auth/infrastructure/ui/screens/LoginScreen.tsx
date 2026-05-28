import { useSessionStore } from "../../../../../shared/infrastructure/stores/userSession";
import { translateResultError } from "../../../../../shared/infrastructure/utils/errorsTranslation";
import type { LoginCredentialsProps } from "../../../domain/models/LoginCredentials";
import { AUTH_ERRORS_DICT } from "../../errors/dictionary";
import { useAuthStore } from "../../stores/authStore";
import { AuthFormSurface } from "../components/AuthFormSurface";
import { LoginForm, type LoginActionFormState } from "../components/LoginForm";

export function LoginScreen() {
  const { login } = useAuthStore();
  const theme = useSessionStore((state) => state.theme);

  async function doLogin(credentials: LoginCredentialsProps): Promise<LoginActionFormState> {
    const loginResult = await login(credentials);

    if (!loginResult.isSuccess) {
      return { fields: credentials, errors: { global: translateResultError(loginResult, AUTH_ERRORS_DICT) } };
    }

    return { fields: { username: "", password: "" }, errors: {} };
  }

  return (
    <AuthFormSurface>
      <LoginForm onSubmit={doLogin} brandLogoSrc={theme?.tokens.app.brandLogo} />
    </AuthFormSurface>
  );
}
