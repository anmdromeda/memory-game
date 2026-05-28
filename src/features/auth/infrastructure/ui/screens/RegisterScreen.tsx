import { translateResultError } from "../../../../../shared/infrastructure/utils/errorsTranslation";
import type { RegistrationUserDataProps } from "../../../domain/models/RegistrationUserData";
import { AUTH_ERRORS_DICT } from "../../errors/dictionary";
import { useAuthStore } from "../../stores/authStore";
import { AuthFormSurface } from "../components/AuthFormSurface";
import { RegisterForm, type RegisterFormActionState } from "../components/RegisterForm";

export function RegisterScreen() {
  const { register } = useAuthStore();

  async function doRegister(userData: RegistrationUserDataProps): Promise<RegisterFormActionState> {
    const registerResult = await register(userData);

    if (!registerResult.isSuccess) {
      return {
        fields: userData,
        errors: {
          global: translateResultError(registerResult, AUTH_ERRORS_DICT),
        },
      };
    }

    return { fields: {} as RegisterFormActionState["fields"], errors: {} };
  }

  return (
    <AuthFormSurface>
      <RegisterForm onSubmit={doRegister} />
    </AuthFormSurface>
  );
}
