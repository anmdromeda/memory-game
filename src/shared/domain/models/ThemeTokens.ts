type ActionThemeTokens = {
  readonly bgBase: string;
  readonly bgMedium: string;
  readonly bgDarken: string;
  readonly shadow: string;
};

export type AppTheme = {
  name: string;
  displayName: string;
  tokens: ThemeTokens;
};

export type ThemeTokens = {
  readonly component: {
    containerBg: string;
    containerBackBg: string;
    variantBg: string;
    brandLogoBack?: string;
  };

  readonly actions: {
    primary: ActionThemeTokens;
    secondary: ActionThemeTokens;
  };

  readonly app: {
    baseBg: string;
    surfaceBg: string;
    brandLogo?: string;
  };
};
