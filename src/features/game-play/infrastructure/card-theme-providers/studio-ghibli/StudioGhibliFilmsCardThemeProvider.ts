import { FetchHttpClient } from "../../../../../shared/infrastructure/http/FetchHttpClient";
import {
  CardContentType,
  type CardThemeProvider,
  type CardThemeProviderFetchParams,
  type ProviderTheme,
  type RawCard,
} from "../../../domain/models/Card";

export type StudioGhibliFilm = {
  id: string;
  title: string;
  image: string;
  rt_score: number;
};

const STUDIO_GHIBLI_BASE_API_URL = "https://ghibliapi.vercel.app";

export class StudioGhibliFilmsCardThemeProvider implements CardThemeProvider {
  private http = new FetchHttpClient({ baseUrl: STUDIO_GHIBLI_BASE_API_URL });

  public theme: ProviderTheme = {
    id: "studioGhibli",
    displayName: "Studio Ghibli",
    styles: {
      component: {
        containerBg: "#FFFFFF",
        containerBackBg: "#4A6FA5",
        variantBg: "#8FA882",
      },
      app: {
        baseBg: "#111827",
        surfaceBg: "#F4F7F4",
      },
      actions: {
        primary: {
          bgBase: "#94C1E1",
          bgMedium: "#7BA8C8",
          bgDarken: "#527E9D",
          shadow: "#E6C594",
        },
        secondary: {
          bgBase: "#8FA882",
          bgMedium: "#758E69",
          bgDarken: "#4E6643",
          shadow: "#94C1E1",
        },
      },
    },
  };

  public async fetch(params: CardThemeProviderFetchParams): Promise<RawCard[]> {
    const response = await this.http.get<StudioGhibliFilm[]>("/films");
    const sortedByScore = this.sortDescByRating(response);
    const rawCards = sortedByScore.map((film) => this.toRawCard(film)).slice(0, params.count);

    return rawCards;
  }

  private toRawCard(film: StudioGhibliFilm): RawCard {
    return {
      id: film.id.toString(),
      content: film.image,
      type: CardContentType.Image,
      title: film.title,
    };
  }

  private sortDescByRating(films: StudioGhibliFilm[]) {
    return [...films].sort((a, b) => b.rt_score - a.rt_score);
  }
}
