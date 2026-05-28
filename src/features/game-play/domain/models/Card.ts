import type { ThemeTokens } from "../../../../shared/domain/models/ThemeTokens";

export enum CardContentType {
  Color = "COLOR",
  Image = "IMAGE",
  Text = "TEXT",
}

export enum MemoryCardCardState {
  Flipped = "FLIPPED",
  Idle = "IDLE",
  Matched = "MATCHED",
}

export interface RawCard {
  id: string;
  content: string;
  type: CardContentType;
  title: string;
  subtitle?: string;
}

export interface MemoryCard extends RawCard {
  groupId: string;
  state: MemoryCardCardState;
}

export type MemoryCardGroupList = MemoryCard[][];

export type CardThemeProviderFetchParams = {
  count: number;
};

export type ProviderThemeVisualStyleTokens = ThemeTokens;

export interface ProviderTheme {
  readonly id: string;
  readonly displayName: string;
  readonly styles: ProviderThemeVisualStyleTokens;
}

export interface CardThemeProvider {
  readonly theme: ProviderTheme;
  fetch(params: CardThemeProviderFetchParams): Promise<RawCard[]>;
}

export interface CardThemeProviderFactory {
  getProvider(params: { name: string }): CardThemeProvider;
}
