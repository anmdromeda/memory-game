import type { EventBus } from "../../../../shared/application/EventBus";
import type { GameEffectsManager } from "../models/GameEffects";

export function bootstrapGameEffectsEvents(params: { manager: GameEffectsManager; eventBus: EventBus }) {
  const { manager, eventBus } = params;

  const matchErrorUnsubscribe = eventBus.on("game-play:cards-group-flipped", ({ isMatch }) => {
    if (isMatch) {
      manager.playMatchSuccess();
      return;
    }

    manager.playMatchError();
    manager.shakeBoard();
  });

  const cardFlippedUnsubscribe = eventBus.on("game-play:card-flipped", () => manager.playCardFlip());
  const matchEndedUnsusbcribe = eventBus.on("game-play:match-ended", () => manager.triggerCelebration());
  const buttonPressedUnsubscribe = eventBus.on("game-play:button-pressed", () => manager.playButtonPress());

  return () => {
    matchErrorUnsubscribe();
    cardFlippedUnsubscribe();
    matchEndedUnsusbcribe();
    buttonPressedUnsubscribe();
  };
}
