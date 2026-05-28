import { ArrayShuffler } from "../../../../../shared/domain/utils/arrayShuffler";
import {
  CardContentType,
  type ProviderTheme,
  type CardThemeProvider,
  type CardThemeProviderFetchParams,
  type RawCard,
} from "../../../domain/models/Card";
import emojisJson from "./data.json";

export type EmojiApiItem = {
  emoji: string;
  hexcode: string;
  annotation: string;
  subgroup: string;
};

export type EmojiApiResponse = Array<EmojiApiItem>;

export class EmojisCardThemeProvider implements CardThemeProvider {
  public theme: ProviderTheme = {
    id: "emojis",
    displayName: "Emojis",
    styles: {
      component: {
        containerBg: "#FFFFFF",
        containerBackBg: "#E8ECEF",
        variantBg: "#6B7280",
        brandLogoBack: "",
      },
      app: {
        baseBg: "#1F2937",
        surfaceBg: "#F9FAFB",
        brandLogo: "",
      },
      actions: {
        primary: {
          bgBase: "#FCD34D",
          bgMedium: "#FBBF24",
          bgDarken: "#D97706",
          shadow: "#9CA3AF",
        },
        secondary: {
          bgBase: "#9CA3AF",
          bgMedium: "#4B5563",
          bgDarken: "#374151",
          shadow: "#FCD34D",
        },
      },
    },
  };

  public async fetch(params: CardThemeProviderFetchParams): Promise<RawCard[]> {
    const randomEmojis = ArrayShuffler.shuffle(emojisJson).slice(0, params.count);
    const rawCards = randomEmojis.map((emoji) => this.toRawCard(emoji));

    return rawCards;
  }

  private toRawCard(emoji: EmojiApiItem): RawCard {
    return {
      id: emoji.hexcode,
      type: CardContentType.Text,
      content: emoji.emoji,
      title: emoji.annotation,
      subtitle: emoji.subgroup,
    };
  }
}
