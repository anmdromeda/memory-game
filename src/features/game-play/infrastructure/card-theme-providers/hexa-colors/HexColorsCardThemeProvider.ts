import {
  CardContentType,
  type CardThemeProvider,
  type CardThemeProviderFetchParams,
  type ProviderTheme,
  type RawCard,
} from "../../../domain/models/Card";
import { getHexaColorsList } from "./hexColorsUtils";

export class HexaColorsCardThemeProvider implements CardThemeProvider {
  public theme: ProviderTheme = {
    id: "colors",
    displayName: "Colors",
    styles: {
      component: {
        containerBg: "#FFFFFF",
        containerBackBg: "#3E4A5B",
        variantBg: "#5C6B73",
        brandLogoBack: "",
      },
      app: {
        baseBg: "#1E222A",
        surfaceBg: "#F5F6F8",
        brandLogo: "",
      },
      actions: {
        primary: {
          bgBase: "#4A6FA5",
          bgMedium: "#3B5984",
          bgDarken: "#2C4363",
          shadow: "#E07A5F",
        },
        secondary: {
          bgBase: "#E07A5F",
          bgMedium: "#C96448",
          bgDarken: "#9B4A34",
          shadow: "#4A6FA5",
        },
      },
    },
  };

  public async fetch(params: CardThemeProviderFetchParams): Promise<RawCard[]> {
    const { count } = params;

    const colors = getHexaColorsList(count);

    const rawCards = colors.map(function (color): RawCard {
      return {
        id: color,
        content: color,
        type: CardContentType.Color,
        title: color,
      };
    });

    return rawCards;
  }
}
