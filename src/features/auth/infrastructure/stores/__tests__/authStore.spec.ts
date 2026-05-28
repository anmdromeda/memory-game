import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSessionStore } from "../../../../../shared/infrastructure/stores/userSession";
import { useAuthStore } from "../authStore";
import type { RegistrationUserDataProps } from "../../../domain/models/RegistrationUserData";
import type { LoginUseCase } from "../../../application/LoginUseCase";
import type { RegisterUseCase } from "../../../application/RegisterUseCase";
import type { RetrieveUserInfoUseCase } from "../../../application/RetrieveUserInfoUseCase";
import type { LogoutUseCase } from "../../../application/LogoutUseCase";
import type { UserSession } from "../../../../../shared/domain/models/UserSession";

const mockLoginExecute = vi.fn();
const mockRegisterExecute = vi.fn();
const viMockRetrieveExecute = vi.fn();
const mockLogoutExecute = vi.fn();

vi.mock("../../../application/LoginUseCase", () => ({
  LoginUseCase: function (this: LoginUseCase) {
    this.execute = mockLoginExecute;
  },
}));

vi.mock("../../../application/RegisterUseCase", () => ({
  RegisterUseCase: function (this: RegisterUseCase) {
    this.execute = mockRegisterExecute;
  },
}));

vi.mock("../../../application/RetrieveUserInfoUseCase", () => ({
  RetrieveUserInfoUseCase: function (this: RetrieveUserInfoUseCase) {
    this.execute = viMockRetrieveExecute;
  },
}));

vi.mock("../../../application/LogoutUseCase", () => ({
  LogoutUseCase: function (this: LogoutUseCase) {
    this.execute = mockLogoutExecute;
  },
}));

vi.mock("../../../../../shared/infrastructure/stores/userSession", () => {
  const mockSetSession = vi.fn();
  return {
    useSessionStore: {
      getState: () => ({
        setSession: mockSetSession,
      }),
    },
  };
});

describe("useAuthStore - Infrastructure Zustand Adapter", () => {
  const mockSetSession = useSessionStore.getState().setSession as (session: UserSession) => void;

  const createMockResult = (isSuccess: boolean, value: unknown = null) => ({
    isSuccess,
    getValue: () => value,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      loadingAction: false,
      retrievingUser: true,
    });
  });

  describe("Initial Default State", () => {
    it("should initialize with correct default loading and retrieval flags", () => {
      const state = useAuthStore.getState();
      expect(state.loadingAction).toBe(false);
      expect(state.retrievingUser).toBe(true);
    });
  });

  describe("Register Execution Flow", () => {
    it("should handle successful registration, toggle loading, and synchronize global session", async () => {
      const mockUser = { id: "user-abc-123", username: "clash_king" };
      const successResult = createMockResult(true, mockUser);

      mockRegisterExecute.mockResolvedValue(successResult);

      const credentials = {
        username: "clash_king",
        password: "password123",
        firstName: "First",
        lastName: "Last",
        confirmPassword: "password123",
      } as RegistrationUserDataProps;

      const promise = useAuthStore.getState().register(credentials);
      expect(useAuthStore.getState().loadingAction).toBe(true);

      const result = await promise;

      expect(result).toEqual(successResult);
      expect(mockRegisterExecute).toHaveBeenCalledWith(credentials);
      expect(useAuthStore.getState().loadingAction).toBe(false);
      expect(mockSetSession).toHaveBeenCalledWith({
        id: "user-abc-123",
        username: "clash_king",
      });
    });

    it("should toggle loading off and bypass global session mutation when registration fails", async () => {
      const failureResult = createMockResult(false);
      mockRegisterExecute.mockResolvedValue(failureResult);

      const result = await useAuthStore.getState().register({} as RegistrationUserDataProps);

      expect(result.isSuccess).toBe(false);
      expect(useAuthStore.getState().loadingAction).toBe(false);
      expect(mockSetSession).not.toHaveBeenCalled();
    });
  });

  describe("Login Execution Flow", () => {
    it("should handle successful login, manipulate lifecycle loaders, and dispatch domain payload into userSession", async () => {
      const mockUser = { id: "pekka-999", username: "pekka_arena" };
      const successResult = createMockResult(true, mockUser);
      mockLoginExecute.mockResolvedValue(successResult);

      const credentials = { username: "pekka_arena", password: "password123" };

      const promise = useAuthStore.getState().login(credentials);
      expect(useAuthStore.getState().loadingAction).toBe(true);

      const result = await promise;

      expect(result.isSuccess).toBe(true);
      expect(useAuthStore.getState().loadingAction).toBe(false);
      expect(mockSetSession).toHaveBeenCalledWith({
        id: "pekka-999",
        username: "pekka_arena",
      });
    });
  });

  describe("Retrieve User Info Execution Flow", () => {
    it("should manage retrievingUser flags during execution and sync payload if found", async () => {
      const mockUser = { id: "mago-456", username: "mago_arena" };
      const successResult = createMockResult(true, mockUser);
      viMockRetrieveExecute.mockResolvedValue(successResult);

      const promise = useAuthStore.getState().retrieveUserInfo();
      expect(useAuthStore.getState().retrievingUser).toBe(true);

      await promise;

      expect(useAuthStore.getState().retrievingUser).toBe(false);
      expect(mockSetSession).toHaveBeenCalledWith({
        id: "mago-456",
        username: "mago_arena",
      });
    });
  });

  describe("Logout Execution Flow", () => {
    it("should clear the global state context using a null payload allocation when logout scenario is successful", async () => {
      const successResult = createMockResult(true);
      mockLogoutExecute.mockResolvedValue(successResult);

      await useAuthStore.getState().logout();

      expect(mockLogoutExecute).toHaveBeenCalledTimes(1);
      expect(mockSetSession).toHaveBeenCalledWith(null);
    });

    it("should ignore session cleanups if the Application logout workflow fails internally", async () => {
      const failureResult = createMockResult(false);
      mockLogoutExecute.mockResolvedValue(failureResult);

      await useAuthStore.getState().logout();

      expect(mockSetSession).not.toHaveBeenCalled();
    });
  });
});
