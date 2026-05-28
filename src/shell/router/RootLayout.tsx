import { Outlet } from "react-router-dom";
import { useSessionStore } from "../../shared/infrastructure/stores/userSession";
import { Navbar } from "../../shared/infrastructure/ui/components/Navbar";
import { Layout } from "../../shared/infrastructure/ui/components/Layout";
import type { AppTheme } from "../../shared/domain/models/ThemeTokens";

export function RootLayout() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const theme = useSessionStore((state) => state.theme as AppTheme);

  const navbarElement = isAuthenticated ? (
    <Navbar
      title="Juego de memoria"
      brandLogoSrc={theme.tokens.app.brandLogo}
      brandDisplayName={theme.displayName}
      showBrandDisplayName={!theme.tokens.app.brandLogo}
    />
  ) : null;

  return (
    <Layout navbar={navbarElement}>
      <Outlet />
    </Layout>
  );
}
