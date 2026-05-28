import { describe, it, expect, beforeEach } from "vitest";
import type { UserSession } from "../../../domain/models/UserSession";
import { useSessionStore } from "../userSession";

describe("useSessionStore - Global Session Zustand Adapter", () => {
  const mockUserSession: UserSession = {
    id: "pekka-999",
    username: "pekka@arena.com",
  };

  beforeEach(() => {
    useSessionStore.setState({
      session: null,
      isAuthenticated: false,
    });
  });

  describe("Initial Default State", () => {
    it("should initialize with a null session and unauthenticated status", () => {
      const state = useSessionStore.getState();

      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("Session Mutations (setSession)", () => {
    it("should securely store the user session payload and flip authentication flags to true", () => {
      useSessionStore.getState().setSession(mockUserSession);

      const updatedState = useSessionStore.getState();
      expect(updatedState.session).toEqual(mockUserSession);
      expect(updatedState.isAuthenticated).toBe(true);
    });

    it("should clear the session data and flag authentication as false when receiving a null allocation", () => {
      useSessionStore.setState({ session: mockUserSession, isAuthenticated: true });
      useSessionStore.getState().setSession(null);

      const updatedState = useSessionStore.getState();
      expect(updatedState.session).toBeNull();
      expect(updatedState.isAuthenticated).toBe(false);
    });
  });
});
