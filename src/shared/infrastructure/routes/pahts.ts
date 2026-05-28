export const AppRoutesPath = {
  Auth: {
    Login: "/login",
    Register: "/register",
    SendCode: "/send-code",
    RestorePassword: "/restore-password",
  },

  GamePlay: {
    Dashboard: "/game",
  },
} as const;

export type AppPath = (typeof AppRoutesPath)[keyof typeof AppRoutesPath];
