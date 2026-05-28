import { generateRandomNumbers } from "../../../../../shared/domain/utils/number";
import {
  CardContentType,
  type CardThemeProvider,
  type CardThemeProviderFetchParams,
  type ProviderTheme,
  type RawCard,
} from "../../../domain/models/Card";

export class NumbersCardThemeProvider implements CardThemeProvider {
  public theme: ProviderTheme = {
    id: "numbers",
    displayName: "Numbers",
    styles: {
      component: {
        containerBg: "#FFFFFF",
        containerBackBg: "#475569",
        variantBg: "#334155",
        brandLogoBack: undefined,
      },
      app: {
        baseBg: "#0F172A",
        surfaceBg: "#F8FAFC",
        brandLogo: undefined,
      },
      actions: {
        primary: {
          bgBase: "#E0F2FE",
          bgMedium: "#BAE6FD",
          bgDarken: "#7DD3FC",
          shadow: "#0369A1",
        },
        secondary: {
          bgBase: "#DCFCE7",
          bgMedium: "#BBF7D0",
          bgDarken: "#86EFAC",
          shadow: "#15803D",
        },
      },
    },
  };

  public async fetch(params: CardThemeProviderFetchParams): Promise<RawCard[]> {
    const { count } = params;

    const digits = generateRandomNumbers({ min: 0, max: 99, count });

    const rawCards = digits.map(function (number): RawCard {
      const strValue = number.toString();

      return {
        id: strValue,
        content: strValue,
        type: CardContentType.Text,
        title: `Number ${strValue}`,
      };
    });

    return rawCards;
  }
}
