import React from "react";
import { type MemoryCard } from "../../../../domain/models/Card";
import { GameCard } from "../GameCard/GameCard";
import "./GameBoard.scss";
import { computedClassNames } from "../../../../../../shared/infrastructure/utils/computedClassNames";
import { useSessionStore } from "../../../../../../shared/infrastructure/stores/userSession";
import type { AppTheme } from "../../../../../../shared/domain/models/ThemeTokens";

interface GameBoardProps {
  items: MemoryCard[];
  onItemClick?(id: MemoryCard["id"]): void;
  isShaking?: boolean;
  readonly?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ items, onItemClick, isShaking, readonly }) => {
  const theme = useSessionStore((state) => state.theme as AppTheme);

  const gameBoardClassNames = computedClassNames({
    "game-board": true,
    "game-board--is-shaking": isShaking,
    "game-board--readonly": readonly,
  });

  return (
    <section className={gameBoardClassNames}>
      <ul className="game-board__grid">
        {items.map((item) => {
          return (
            <li key={item.id} className="game-board__item">
              <GameCard
                card={item}
                onClick={() => {
                  if (readonly) return;
                  onItemClick?.(item.id);
                }}
                backFaceLogo={theme.tokens.component.brandLogoBack}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
};
