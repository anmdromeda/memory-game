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
  };
};
