import type { ThemeTokens } from "../../../domain/models/ThemeTokens";

export function setGlobalThemeVariables(styles: ThemeTokens): void {
  const root = document.documentElement;

  root.style.setProperty("--app-base-bg", styles.app.baseBg);
  root.style.setProperty("--app-surface-bg", styles.app.surfaceBg);

  root.style.setProperty("--component-container-bg", styles.component.containerBg);
  root.style.setProperty("--component-container-back-bg", styles.component.containerBackBg);
  root.style.setProperty("--component-variant-bg", styles.component.variantBg);

  root.style.setProperty("--action-primary-bg-base", styles.actions.primary.bgBase);
  root.style.setProperty("--action-primary-bg-medium", styles.actions.primary.bgMedium);
  root.style.setProperty("--action-primary-bg-darken", styles.actions.primary.bgDarken);
  root.style.setProperty("--action-primary-shadow", styles.actions.primary.shadow);

  root.style.setProperty("--action-secondary-bg-base", styles.actions.secondary.bgBase);
  root.style.setProperty("--action-secondary-bg-medium", styles.actions.secondary.bgMedium);
  root.style.setProperty("--action-secondary-bg-darken", styles.actions.secondary.bgDarken);
  root.style.setProperty("--action-secondary-shadow", styles.actions.secondary.shadow);
}
