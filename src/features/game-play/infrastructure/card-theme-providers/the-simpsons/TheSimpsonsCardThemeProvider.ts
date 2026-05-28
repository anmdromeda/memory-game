import { FetchHttpClient } from "../../../../../shared/infrastructure/http/FetchHttpClient";
import {
  CardContentType,
  type CardThemeProvider,
  type CardThemeProviderFetchParams,
  type ProviderTheme,
  type RawCard,
} from "../../../domain/models/Card";

export type TheSimpsonsCharactersResponse = {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };

  results: Array<TheSimpsonsCharacter>;
};

export type TheSimpsonsCharacter = {
  id: number;
  name: string;
  portrait_path: string;
  occupation: string;
};

const THE_SIMPSONS_API_BASE_URL = "https://thesimpsonsapi.com/api";
const THE_SIMPSONS_API_BASE_CDN_URL = "https://cdn.thesimpsonsapi.com";
const CHARACTER_PORTRAIT_SIZE_PX = 500;

export class TheSimpsonsCardThemeProvider implements CardThemeProvider {
  private http = new FetchHttpClient({ baseUrl: THE_SIMPSONS_API_BASE_URL });

  public theme: ProviderTheme = {
    id: "theSimpsons",
    displayName: "The Simpsons",
    styles: {
      component: {
        containerBg: "#FFFFFF",
        containerBackBg: "#FF94C2",
        variantBg: "#2997FF",
      },
      app: {
        baseBg: "#111625",
        surfaceBg: "#EBF3FE",
      },
      actions: {
        primary: {
          bgBase: "#FED41D",
          bgMedium: "#E2BC14",
          bgDarken: "#A58807",
          shadow: "#2997FF",
        },
        secondary: {
          bgBase: "#2997FF",
          bgMedium: "#1A7FE0",
          bgDarken: "#0F57A1",
          shadow: "#FF94C2",
        },
      },
    },
  };

  public async fetch(params: CardThemeProviderFetchParams): Promise<RawCard[]> {
    const response = await this.http.get<TheSimpsonsCharactersResponse>("/characters");
    const rawCards = response.results.map((character) => this.toRawCard(character)).slice(0, params.count);

    return rawCards;
  }

  private toRawCard(character: TheSimpsonsCharacter): RawCard {
    return {
      id: character.id.toString(),
      content: `${THE_SIMPSONS_API_BASE_CDN_URL}/${CHARACTER_PORTRAIT_SIZE_PX}${character.portrait_path}`,
      type: CardContentType.Image,
      title: character.name,
      subtitle: character.occupation,
    };
  }
}
