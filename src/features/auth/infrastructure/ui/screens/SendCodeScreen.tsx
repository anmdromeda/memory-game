import { useState } from "react";
import type { SendRecoverPasswordCodeInput } from "../../../application/SendRecoverPasswordCodeUseCase";
import { useAuthStore } from "../../stores/authStore";
import { AuthFormSurface } from "../components/AuthFormSurface";
import {
  SendRecoverPasswordCodeForm,
  type SendRecoverPasswordCodeFormActionState,
} from "../components/SendRecoverPasswordCodeForm";
import { ActionMessage } from "../../../../../shared/infrastructure/ui/components/ActionMessage";
import { AUTH_ERRORS_DICT } from "../../errors/dictionary";
import { translateResultError } from "../../../../../shared/infrastructure/utils/errorsTranslation";

export function SendCodeScreen() {
  const sendRecoverPasswordCode = useAuthStore((state) => state.sendRecoverPasswordCode);
  const [showSucessMessage, setShowSuccessMessage] = useState(false);

  async function handleSendCode(data: SendRecoverPasswordCodeInput): Promise<SendRecoverPasswordCodeFormActionState> {
    const result = await sendRecoverPasswordCode(data);

    setShowSuccessMessage(result.isSuccess);

    if (!result.isSuccess) {
      return { fields: data, errors: { global: translateResultError(result, AUTH_ERRORS_DICT) } };
    }

    return { fields: { email: data.email }, errors: {} };
  }

  return (
    <AuthFormSurface>
      {showSucessMessage ? (
        <ActionMessage
          message="Correo enviado. Revisa tu bandeja de entrada (y la carpeta de spam) para restablecer tu contraseña."
          actionLabel="Enviar de nuevo"
          onAction={() => setShowSuccessMessage(false)}
          variant="primary"
          tone="darken"
        />
      ) : (
        <SendRecoverPasswordCodeForm onSubmit={handleSendCode} />
      )}
    </AuthFormSurface>
  );
}
