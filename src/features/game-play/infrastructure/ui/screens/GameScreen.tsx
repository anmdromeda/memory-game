/* eslint-disable react-hooks/exhaustive-deps */
import { GameLayout } from "../components/GameLayout";
import { useEffect } from "react";
import { useGameEffectsStore } from "../../stores/gameEffects";
import { useGameStore } from "../../stores/gameStore";
import { inMemoryEventBus } from "../../../../../shared/infrastructure/bus/InMemoryEventBus";

export function GameScreen() {
  const gameSession = useGameStore((state) => state.session);
  const loadingDeck = useGameStore((state) => state.loadingDeck);
  const hasError = useGameStore((state) => state.hasError);
  const initSession = useGameStore((state) => state.initSession);
  const selectCard = useGameStore((state) => state.selectCard);
  const startGame = useGameStore((state) => state.startGame);
  const endGame = useGameStore((state) => state.endGame);

  const isShaking = useGameEffectsStore((state) => state.isBoardShaking);
  const bootstrapEffects = useGameEffectsStore((state) => state.bootstrapEffects);

  function handleLeave() {
    inMemoryEventBus.emit("auth:logout-requested");
  }

  useEffect(() => {
    const teardownEffects = bootstrapEffects();
    initSession();
    return () => teardownEffects();
  }, []);

  return (
    <GameLayout
      session={gameSession}
      onPlayBtnClick={startGame}
      shakeBoard={isShaking}
      onSelectCard={selectCard}
      loadingDeck={loadingDeck}
      onLeaveBtnClick={handleLeave}
      onGoHome={endGame}
      hasDeckError={hasError}
      onReload={initSession}
    />
  );
}
