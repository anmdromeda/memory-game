import { create } from "zustand";
import { HTML5GameEffectsManager } from "../effects/Html5GameEffects";
import { inMemoryEventBus } from "../../../../shared/infrastructure/bus/InMemoryEventBus";
import { bootstrapGameEffectsEvents } from "../../domain/utils/bootstrapGameEffectsEvents";

interface GameEffectsStore {
  isBoardShaking: boolean;
  setBoardShaking: (shaking: boolean) => void;
  bootstrapEffects: () => () => void;
}

export const useGameEffectsStore = create<GameEffectsStore>((set) => {
  return {
    isBoardShaking: false,

    setBoardShaking: (shaking) => set({ isBoardShaking: shaking }),

    bootstrapEffects() {
      const manager = new HTML5GameEffectsManager({
        onBoardShake(shaking) {
          set({ isBoardShaking: shaking });
        },
      });

      return bootstrapGameEffectsEvents({ manager, eventBus: inMemoryEventBus });
    },
  };
});
