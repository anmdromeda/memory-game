import { generateRandomNumbers } from "../../../../../shared/domain/utils/number";
import { FetchHttpClient } from "../../../../../shared/infrastructure/http/FetchHttpClient";
import {
  CardContentType,
  type CardThemeProvider,
  type CardThemeProviderFetchParams,
  type ProviderTheme,
  type RawCard,
} from "../../../domain/models/Card";
import brandLogoBack from "./assets/brand-logo-back.png";

export type PokeApiListResponse = {
  count: number;
  next: string;
  previous: null | string;
  results: Array<{ name: string; url: string }>;
};

export type PokeApiPokemonData = {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      dream_world: { front_default: string | null };
    } | null;
  };
  types: Array<{
    slot: number;
    type: {
      name: string;
    };
  }>;
};

const POKE_API_BASE_URL = "https://pokeapi.co/api/v2";

export class PokeApiCardThemeProvider implements CardThemeProvider {
  private http = new FetchHttpClient({ baseUrl: POKE_API_BASE_URL });

  public theme: ProviderTheme = {
    id: "pokemon",
    displayName: "Pokémon",
    styles: {
      component: {
        containerBg: "#FFFFFF",
        containerBackBg: "#FFFFFF",
        variantBg: "#E53935",
        brandLogoBack,
      },
      app: {
        baseBg: "#0F1A30",
        surfaceBg: "#F1F4F8",
        brandLogo: "",
      },
      actions: {
        primary: {
          bgBase: "#E53935",
          bgMedium: "#C62828",
          bgDarken: "#B71C1C",
          shadow: "#FFB300",
        },
        secondary: {
          bgBase: "#FFB300",
          bgMedium: "#FFA000",
          bgDarken: "#FF8F00",
          shadow: "#1C355E",
        },
      },
    },
  };

  public async fetch(params: CardThemeProviderFetchParams): Promise<RawCard[]> {
    const response = await this.http.get<PokeApiListResponse>("/pokemon", {
      params: {
        limit: params.count,
      },
    });

    const randomIds = generateRandomNumbers({ min: 1, max: response.count / 2, count: params.count });

    const pokemonsData = await Promise.all(
      randomIds.map((pokemonId) => {
        return this.http.get<PokeApiPokemonData>(`${POKE_API_BASE_URL}/pokemon/${pokemonId}/`);
      }),
    );

    const rawCards = pokemonsData.map((pokemon) => this.toRawCard(pokemon));

    return rawCards;
  }

  private getPokemonType(pokemon: PokeApiPokemonData) {
    if (!pokemon.types.length) {
      return "";
    }

    return pokemon.types.map(({ type }) => type.name).join(", ");
  }

  private getPokemonImageSrc(pokemon: PokeApiPokemonData): string {
    return pokemon.sprites.other?.dream_world.front_default ?? pokemon.sprites.front_default;
  }

  private toRawCard(pokemon: PokeApiPokemonData): RawCard {
    return {
      id: pokemon.id.toString(),
      type: CardContentType.Image,
      content: this.getPokemonImageSrc(pokemon),
      title: pokemon.name,
      subtitle: this.getPokemonType(pokemon),
    };
  }
}
