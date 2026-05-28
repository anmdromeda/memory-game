import { FetchHttpClient } from "../../../../../shared/infrastructure/http/FetchHttpClient";
import {
  CardContentType,
  type ProviderTheme,
  type CardThemeProvider,
  type CardThemeProviderFetchParams,
  type RawCard,
} from "../../../domain/models/Card";

export type DragonBallApiCharacter = {
  id: number;
  name: string;
  image: string;
  race: string;
};

export type DragonBallApiResult = {
  items: Array<DragonBallApiCharacter>;
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first: string | null;
    previous: string | null;
    next: string | null;
    last: string | null;
  };
};

const DRAGON_BALL_API_BASE_URL = "https://dragonball-api.com/api";

export class DragonBallApiCharactersCardThemeProvider implements CardThemeProvider {
  public theme: ProviderTheme = {
    id: "dragonBall",
    displayName: "Dragon Ball",
    styles: {
      component: {
        containerBg: "#FFFFFF",
        containerBackBg: "#FFFFFF",
        variantBg: "#2D50A2",
        brandLogoBack: "",
      },
      app: {
        baseBg: "#10162F",
        surfaceBg: "#F4F6FA",
        brandLogo: "",
      },
      actions: {
        primary: {
          bgBase: "#F25C05",
          bgMedium: "#D14D00",
          bgDarken: "#9E3600",
          shadow: "#F2C811",
        },
        secondary: {
          bgBase: "#F2C811",
          bgMedium: "#D6AF04",
          bgDarken: "#9E8000",
          shadow: "#2D50A2",
        },
      },
    },
  };

  private http = new FetchHttpClient({ baseUrl: DRAGON_BALL_API_BASE_URL });

  public async fetch(params: CardThemeProviderFetchParams): Promise<RawCard[]> {
    const response = await this.http.get<DragonBallApiResult>("/characters", {
      params: {
        limit: params.count,
      },
    });

    const rawCards = response.items.map((character) => this.toRawCard(character));

    return rawCards;
  }

  private toRawCard(character: DragonBallApiCharacter): RawCard {
    return {
      id: character.id.toString(),
      type: CardContentType.Image,
      content: character.image,
      title: character.name,
      subtitle: character.race,
    };
  }
}
