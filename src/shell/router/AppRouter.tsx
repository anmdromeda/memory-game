import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { ProtectedRoute, PublicRoute } from "./Guards";
import { GameScreen } from "../../features/game-play/infrastructure/ui/screens/GameScreen";
import { useAuthStore } from "../../features/auth/infrastructure/stores/authStore";
import { SplashScreen } from "../../shared/infrastructure/ui/components/SplashScreen";
import { LoginScreen } from "../../features/auth/infrastructure/ui/screens/LoginScreen";
import { RegisterScreen } from "../../features/auth/infrastructure/ui/screens/RegisterScreen";
import { SendCodeScreen } from "../../features/auth/infrastructure/ui/screens/SendCodeScreen";
import { RestorePasswordScreen } from "../../features/auth/infrastructure/ui/screens/RestorePasswordScreen";
import { AppRoutesPath } from "../../shared/infrastructure/routes/pahts";
import { ErrorScreen } from "../../shared/infrastructure/ui/screens/ErrorScreen/ErrorScreen";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorScreen />,
    children: [
      {
        index: true,
        element: <Navigate to={AppRoutesPath.GamePlay.Dashboard} replace />,
      },
      {
        element: <PublicRoute />,
        children: [
          {
            path: AppRoutesPath.Auth.Login,
            element: <LoginScreen />,
          },
          {
            path: AppRoutesPath.Auth.Register,
            element: <RegisterScreen />,
          },
          {
            path: AppRoutesPath.Auth.SendCode,
            element: <SendCodeScreen />,
          },
          {
            path: AppRoutesPath.Auth.RestorePassword,
            element: <RestorePasswordScreen />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: AppRoutesPath.GamePlay.Dashboard,
            element: <GameScreen />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to={AppRoutesPath.GamePlay.Dashboard} replace />,
      },
    ],
  },
]);

useAuthStore.getState().retrieveUserInfo();

export function AppRouter() {
  const retrievingUser = useAuthStore((state) => state.retrievingUser);

  if (retrievingUser) {
    return <SplashScreen />;
  }

  return <RouterProvider router={router} />;
}
