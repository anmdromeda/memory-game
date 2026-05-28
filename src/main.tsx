import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./shell/App.tsx";
import "./shared/infrastructure/ui/styles/variables.css";
import "./shared/infrastructure/ui/styles/global.css";
import { initAppThemeByThemeQueryParam } from "./shell/utils/initTheme.ts";

initAppThemeByThemeQueryParam();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
