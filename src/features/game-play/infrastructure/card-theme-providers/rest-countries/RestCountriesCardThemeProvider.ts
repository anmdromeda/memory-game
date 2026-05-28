import { FetchHttpClient } from "../../../../../shared/infrastructure/http/FetchHttpClient";
import {
  CardContentType,
  type CardThemeProvider,
  type CardThemeProviderFetchParams,
  type ProviderTheme,
  type RawCard,
} from "../../../domain/models/Card";

export type RestCountryItem = {
  flags: {
    png: string;
    svg: string;
  };
  name: {
    common: string;
    official: string;
  };
  population: number;
};

export type RestCountriesResponse = Array<RestCountryItem>;

const REST_COUNTRIES_API_BASE_URL = "https://restcountries.com/v3.1";

export class RestCountriesCardThemeProvider implements CardThemeProvider {
  private http = new FetchHttpClient({ baseUrl: REST_COUNTRIES_API_BASE_URL });

  public theme: ProviderTheme = {
    id: "countries",
    displayName: "Countries",
    styles: {
      component: {
        containerBg: "#FFFFFF",
        containerBackBg: "#D1BA9A",
        variantBg: "#4A6B82",
        brandLogoBack: "",
      },
      app: {
        baseBg: "#1F1A16",
        surfaceBg: "#FDFAF4",
        brandLogo: "",
      },
      actions: {
        primary: {
          bgBase: "#F3EDE2",
          bgMedium: "#E3D7C3",
          bgDarken: "#CDBC9F",
          shadow: "#4A6B82",
        },
        secondary: {
          bgBase: "#D0E1ED",
          bgMedium: "#B4CEE0",
          bgDarken: "#90B3CC",
          shadow: "#D1BA9A",
        },
      },
    },
  };

  public async fetch(params: CardThemeProviderFetchParams): Promise<RawCard[]> {
    const response = await this.http.get<RestCountriesResponse>("/region/america", {
      params: {
        fields: "name,flags,population",
      },
    });

    const sortedByPopulation = this.sortDescByPopulation(response);
    const rawCards = sortedByPopulation.map((country) => this.toRawCard(country)).slice(0, params.count);

    return rawCards;
  }

  private toRawCard(country: RestCountryItem): RawCard {
    return {
      id: country.name.common,
      content: country.flags.svg,
      type: CardContentType.Image,
      title: country.name.common,
    };
  }

  private sortDescByPopulation(countries: RestCountriesResponse) {
    return [...countries].sort((a, b) => b.population - a.population);
  }
}
