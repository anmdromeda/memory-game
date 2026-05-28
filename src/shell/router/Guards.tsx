import { Navigate, Outlet } from "react-router";
import { useSessionStore } from "../../shared/infrastructure/stores/userSession";
import { AppRoutesPath } from "../../shared/infrastructure/routes/pahts";

export function ProtectedRoute() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to={AppRoutesPath.Auth.Login} replace />;
}

export function PublicRoute() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

  return !isAuthenticated ? <Outlet /> : <Navigate to={AppRoutesPath.GamePlay.Dashboard} replace />;
}
