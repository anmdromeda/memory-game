import { ArrayShuffler } from "../../../../../shared/domain/utils/arrayShuffler";
import { CardThemeProviderNotFoundError } from "../../../domain/errors/CardErrors";
import { DragonBallApiCharactersCardThemeProvider } from "../dragon-ball/DragonBallApiCharacterCardThemeProvider";
import { EmojisCardThemeProvider } from "../emojis/EmojisCardThemeProvider";
import { HexaColorsCardThemeProvider } from "../hexa-colors/HexColorsCardThemeProvider";
import { NumbersCardThemeProvider } from "../numbers/NumbersCardThemeProvider";
import { PokeApiCardThemeProvider } from "../poke-api/PokeApiCardThemeProvider";
import { RestCountriesCardThemeProvider } from "../rest-countries/RestCountriesCardThemeProvider";
import { RickAndMortyCharactersCardThemeProvider } from "../rick-and-morty/RickAndMortyCharactersCardThemeProvider";
import { StudioGhibliFilmsCardThemeProvider } from "../studio-ghibli/StudioGhibliFilmsCardThemeProvider";
import { TheSimpsonsCardThemeProvider } from "../the-simpsons/TheSimpsonsCardThemeProvider";
import type { CardThemeProvider, CardThemeProviderFactory } from "../../../domain/models/Card";

const PROVIDERS: Array<CardThemeProvider> = [
  new RickAndMortyCharactersCardThemeProvider(),
  new StudioGhibliFilmsCardThemeProvider(),
  new NumbersCardThemeProvider(),
  new PokeApiCardThemeProvider(),
  new RestCountriesCardThemeProvider(),
  new TheSimpsonsCardThemeProvider(),
  new DragonBallApiCharactersCardThemeProvider(),
  new HexaColorsCardThemeProvider(),
  new EmojisCardThemeProvider(),
];

const PROVIDERS_IDS = PROVIDERS.map((provider) => provider.theme.id);

export class GameThemeProviderFactory implements CardThemeProviderFactory {
  public getProvider(context: { name: string }): CardThemeProvider {
    if (context.name === "random") {
      return this.getRandomProvider();
    }

    const providerName = context.name;

    if (!PROVIDERS_IDS.includes(providerName)) {
      throw new CardThemeProviderNotFoundError(
        providerName,
        PROVIDERS.map((provider) => provider.theme.id),
      );
    }

    const provider = PROVIDERS.find((provider) => provider.theme.id === providerName);

    return provider as CardThemeProvider;
  }

  private getRandomProvider() {
    const providersArr = [...Object.values(PROVIDERS)];
    const [RandomProvider] = ArrayShuffler.shuffle(providersArr);

    return RandomProvider;
  }
}
