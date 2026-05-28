export type GameEffectsCallbacks = {
  onBoardShake(shaking: boolean): void;
};

export abstract class GameEffectsManager {
  constructor(protected callbacks?: GameEffectsCallbacks) {}

  abstract playCardFlip(): void;
  abstract playMatchSuccess(): void;
  abstract playMatchError(): void;
  abstract shakeBoard(): void;
  abstract triggerCelebration(): void;
  abstract playButtonPress(): void;
}

export interface GameEffectsState {
  isBoardShaking: boolean;
}
