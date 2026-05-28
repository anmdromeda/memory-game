import { describe, expect, it } from "vitest";
import { GameThemeProviderFactory } from "../RawCardThemeProviderFactory";
import { RickAndMortyCharactersCardThemeProvider } from "../../rick-and-morty/RickAndMortyCharactersCardThemeProvider";
import { EmojisCardThemeProvider } from "../../emojis/EmojisCardThemeProvider";

describe("GameThemeProviderFactory - Unit Test", () => {
  const factory = new GameThemeProviderFactory();

  it("should successfully return random provider instance", () => {
    const randomProvider = factory.getProvider({ name: "random" });
    expect(randomProvider).toBeDefined();
  });

  it("should successfully return the correct provider instance when a valid name is provided", () => {
    const rickAndMortyProvider = factory.getProvider({ name: "rickAndMorty" });
    expect(rickAndMortyProvider).toBeInstanceOf(RickAndMortyCharactersCardThemeProvider);

    const emojisProvider = factory.getProvider({ name: "emojis" });
    expect(emojisProvider).toBeInstanceOf(EmojisCardThemeProvider);
  });

  it("should throw a CardThemeProviderNotFoundError when an invalid provider name is passed", () => {
    const invalidName = "INVALID_PROVIDER_NAME";

    expect(() => factory.getProvider({ name: invalidName })).toThrow();
  });
});
