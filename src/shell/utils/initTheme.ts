import { GameThemeProviderFactory } from "../../features/game-play/infrastructure/card-theme-providers/factory/RawCardThemeProviderFactory";
import { useSessionStore } from "../../shared/infrastructure/stores/userSession";
import { setGlobalThemeVariables } from "../../shared/infrastructure/ui/utils/setGlobalThemeVariables";

export function initAppThemeByThemeQueryParam(): void {
  if (typeof window === "undefined") return;

  const defaultThemeName = "rickAndMorty";
  const queryParams = new URLSearchParams(window.location.search);

  const savedTheme = localStorage.getItem("app_theme");
  const secretThemeName = queryParams.get("theme");
  const activeThemeName = secretThemeName || savedTheme || defaultThemeName;

  const factory = new GameThemeProviderFactory();

  try {
    const { styles: tokens, displayName, id: providerName } = factory.getProvider({ name: activeThemeName }).theme;

    document.title = displayName;

    useSessionStore.getState().setTheme({ name: providerName, tokens, displayName });
    setGlobalThemeVariables(tokens);
    localStorage.setItem("app_theme", activeThemeName);
  } catch (error) {
    console.error("Failed to initialize custom theme, falling back to default behavior:", error);
  }

  if (secretThemeName) {
    queryParams.delete("theme");
    const queryStr = queryParams.toString();
    const cleanUrl = window.location.pathname + (queryStr ? `?${queryStr}` : "");

    window.history.replaceState(null, "", cleanUrl);
  }
}
