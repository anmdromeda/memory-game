import { create } from "zustand";
import type { UserSession } from "../../domain/models/UserSession";
import type { AppTheme } from "../../domain/models/ThemeTokens";

interface SessionState {
  isAuthenticated: boolean;
  session: UserSession | null;
  theme: AppTheme | null;
  setSession: (session: UserSession | null) => void;
  setTheme: (theme: AppTheme) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  isAuthenticated: false,
  theme: null,
  setSession: (session) => set({ session, isAuthenticated: !!session }),
  setTheme: (theme) => set({ theme }),
}));
