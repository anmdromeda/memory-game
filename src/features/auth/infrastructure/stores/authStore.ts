import { create } from "zustand";
import { LoginUseCase } from "../../application/LoginUseCase";
import { RegisterUseCase } from "../../application/RegisterUseCase";
import type { LoginCredentialsProps } from "../../domain/models/LoginCredentials";
import { LocalStorageUserRepository } from "../persistence/LocalUserRepository";
import { AppAuthService } from "../services/AppAuthService";
import { RetrieveUserInfoUseCase } from "../../application/RetrieveUserInfoUseCase";
import { LogoutUseCase } from "../../application/LogoutUseCase";
import type { RegistrationUserDataProps } from "../../domain/models/RegistrationUserData";
import type { User } from "../../domain/models/User";
import { useSessionStore } from "../../../../shared/infrastructure/stores/userSession";
import {
  SendRecoverPasswordCodeUseCase,
  type SendRecoverPasswordCodeInput,
} from "../../application/SendRecoverPasswordCodeUseCase";
import { RestorePasswordUseCase, type RestorePasswordInput } from "../../application/RestorePasswordUseCase";
import { inMemoryEventBus } from "../../../../shared/infrastructure/bus/InMemoryEventBus";

interface AuthStore {
  loadingAction: boolean;
  retrievingUser: boolean;
  login(credentials: LoginCredentialsProps): ReturnType<LoginUseCase["execute"]>;
  register(credentials: RegistrationUserDataProps): ReturnType<RegisterUseCase["execute"]>;
  sendRecoverPasswordCode(
    credentials: SendRecoverPasswordCodeInput,
  ): ReturnType<SendRecoverPasswordCodeUseCase["execute"]>;
  logout(): Promise<void>;
  restorePassword(credentials: RestorePasswordInput): ReturnType<RestorePasswordUseCase["execute"]>;
  retrieveUserInfo(): Promise<void>;
}

const authService = new AppAuthService(new LocalStorageUserRepository());

function syncWithGlobalSession(user: User | null) {
  const setSession = useSessionStore.getState().setSession;

  if (!user) {
    setSession(null);
    return;
  }

  setSession({
    id: user.id,
    username: user.username,
  });
}

export const useAuthStore = create<AuthStore>((set) => {
  return {
    loadingAction: false,
    retrievingUser: true,

    async register(credentials) {
      set({ loadingAction: true });

      const result = await new RegisterUseCase(authService).execute(credentials);

      set({ loadingAction: false });

      if (result.isSuccess) {
        syncWithGlobalSession(result.getValue());
      }

      return result;
    },

    async login(credentials) {
      set({ loadingAction: true });

      const result = await new LoginUseCase(authService).execute(credentials);

      set({ loadingAction: false });

      if (result.isSuccess) {
        syncWithGlobalSession(result.getValue());
      }

      return result;
    },

    async retrieveUserInfo() {
      set({ retrievingUser: true });

      const result = await new RetrieveUserInfoUseCase(authService).execute();

      if (result.isSuccess) {
        syncWithGlobalSession(result.getValue());
      }

      set({ retrievingUser: false });
    },

    async sendRecoverPasswordCode(credentials) {
      set({ loadingAction: true });
      const result = await new SendRecoverPasswordCodeUseCase(authService).execute(credentials);
      set({ loadingAction: false });

      return result;
    },

    async restorePassword(credentials) {
      set({ loadingAction: true });
      const result = await new RestorePasswordUseCase(authService).execute(credentials);
      set({ loadingAction: false });

      return result;
    },

    async logout() {
      const result = await new LogoutUseCase(authService).execute();

      if (result.isSuccess) {
        syncWithGlobalSession(null);
      }
    },
  };
});

inMemoryEventBus.on("auth:logout-requested", useAuthStore.getState().logout);
