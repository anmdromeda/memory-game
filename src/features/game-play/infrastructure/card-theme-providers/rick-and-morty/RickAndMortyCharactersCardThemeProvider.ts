import { generateRandomNumbers } from "../../../../../shared/domain/utils/number";
import { ApolloHttpClient } from "../../../../../shared/infrastructure/http/ApolloHttpClient";
import {
  CardContentType,
  type CardThemeProvider,
  type CardThemeProviderFetchParams,
  type ProviderTheme,
  type RawCard,
} from "../../../domain/models/Card";
import brandLogo from "./assets/brand-logo.png";
import brandLogoBack from "./assets/brand-logo-back.png";

export type RickAndMortyCharacter = {
  id: number;
  name: string;
  image: string;
  species: string;
};

export type RickAndMortyCharactersResponse = {
  characters: { results: Array<RickAndMortyCharacter>; info: { count: number } };
  charactersByIds: Array<RickAndMortyCharacter>;
};

const RICK_AND_MORTY_API_BASE_URL = "https://rickandmortyapi.com/graphql";

export class RickAndMortyCharactersCardThemeProvider implements CardThemeProvider {
  private http = new ApolloHttpClient({ baseUrl: RICK_AND_MORTY_API_BASE_URL });

  public theme: ProviderTheme = {
    id: "rickAndMorty",
    displayName: "Rick and Morty",
    styles: {
      component: {
        containerBg: "#FFFFFF",
        containerBackBg: "#A2F2F9",
        variantBg: "#D8E054",
        brandLogoBack: brandLogoBack,
      },
      app: {
        baseBg: "#1C1D3B",
        surfaceBg: "#FFFAC2 ",
        brandLogo,
      },
      actions: {
        primary: {
          bgBase: "#A2F2F9",
          bgMedium: "#49D5E1",
          bgDarken: "#1A7A83",
          shadow: "#E6EC59 ",
        },
        secondary: {
          bgBase: "#D8E054",
          bgMedium: "#B1B83B",
          bgDarken: "#73781C",
          shadow: "#A2F2F9",
        },
      },
    },
  };

  public async fetch(params: CardThemeProviderFetchParams): Promise<RawCard[]> {
    const charactersCountResponse = await this.http.get<RickAndMortyCharactersResponse>(`
      query {
        characters {
          info {
            count
          }
        }
      }`);

    const charactersCount = charactersCountResponse.characters.info.count;
    const randomIds = generateRandomNumbers({ min: 1, max: charactersCount, count: params.count });

    const response = await this.http.get<RickAndMortyCharactersResponse>(
      `
    query CharactersByIds($ids: [ID!]!) {
      charactersByIds(ids: $ids) {
        id
        image
        name
        status
        species
      }
    }`,
      {
        params: {
          ids: randomIds,
        },
      },
    );

    const { charactersByIds } = response;

    const rawCards = charactersByIds.map((character) => this.toRawCard(character)).slice(0, params.count);
    return rawCards;
  }

  private toRawCard(character: RickAndMortyCharacter): RawCard {
    return {
      id: character.id.toString(),
      content: character.image,
      type: CardContentType.Image,
      title: character.name,
      subtitle: character.species,
    };
  }
}
