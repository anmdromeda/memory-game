import React from "react";
import "./GameLayout.scss";
import { Surface } from "../../../../../../shared/infrastructure/ui/components/Surface";
import { GameStatus, type GameSessionSnapshot } from "../../../../domain/models/GameSession";
import { Heading } from "../../../../../../shared/infrastructure/ui/components/Heading";
import { GameStats } from "../GameStats";
import { Spinner } from "../../../../../../shared/infrastructure/ui/components/Spinner";
import { GameBoard } from "../GameBoard";
import { GameSummary } from "../GameSummary";
import { ActionMessage } from "../../../../../../shared/infrastructure/ui/components/ActionMessage";
import { GameButton } from "../GameButton";

export interface GameLayoutProps {
  onPlayBtnClick?(): void;
  onLeaveBtnClick?(): void;
  onGoHome?(): void;
  onSelectCard(id: string): void;
  onReload?(): void;
  session?: GameSessionSnapshot | null;
  loadingDeck?: boolean;
  shakeBoard?: boolean;
  hasDeckError?: boolean;
}

export function GameLayout({
  onPlayBtnClick,
  session,
  loadingDeck,
  onSelectCard,
  shakeBoard,
  onGoHome,
  onLeaveBtnClick,
  hasDeckError,
  onReload,
}: GameLayoutProps) {
  const { activePlayerProgress, status, isProcessing, deck } = session ?? {};

  const HeaderComponent: Record<GameStatus, React.ReactNode> = {
    [GameStatus.IDLE]: (
      <Heading size="xl" color="black">
        Personajes
      </Heading>
    ),
    [GameStatus.PLAYING]: activePlayerProgress ? <GameStats playerProgress={activePlayerProgress} /> : null,
    [GameStatus.FINISHED]: (
      <GameSummary turns={activePlayerProgress?.moves ?? 0} onRepeat={onPlayBtnClick} onGoHome={onGoHome} />
    ),
  };

  function handleOnPlayBtnClick() {
    if (isProcessing) return;
    onPlayBtnClick?.();
  }

  const shouldShowBoard = status !== GameStatus.FINISHED && !loadingDeck && !hasDeckError;
  const shouldShowFooter = status === GameStatus.IDLE && !loadingDeck && !hasDeckError;
  const shouldShowReloadAction = hasDeckError && !loadingDeck;

  return (
    <Surface className="game-layout-wrapper">
      <div className="game-layout">
        <header key={status} className="game-layout__header">
          {status ? HeaderComponent[status] : null}
        </header>

        <main className="game-layout__content">
          {loadingDeck ? <Spinner role="progressbar" variant="primary" size="lg" /> : null}

          {shouldShowBoard ? (
            <GameBoard
              items={deck ?? []}
              isShaking={shakeBoard}
              onItemClick={onSelectCard}
              readonly={status !== GameStatus.PLAYING}
            />
          ) : null}

          {shouldShowReloadAction ? (
            <ActionMessage
              message="Hubo un problema al inicializar el tablero. No pudimos cargar las cartas correctamente."
              actionLabel="Reintentar"
              onAction={onReload}
              variant="primary"
              tone="medium"
            />
          ) : null}
        </main>
      </div>

      {shouldShowFooter ? (
        <footer className="game-layout-wrapper__footer">
          <GameButton variant="secondary" onClick={onLeaveBtnClick} action="leave">
            Salir
          </GameButton>

          <GameButton onClick={handleOnPlayBtnClick} action="play">
            Jugar
          </GameButton>
        </footer>
      ) : null}
    </Surface>
  );
}
