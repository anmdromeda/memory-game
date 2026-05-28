import React from "react";
import { CardContentType, type MemoryCard } from "../../../../domain/models/Card";
import { TextCardContent } from "./variants/TextCardContent";
import { ColorCardContent } from "./variants/ColorCardContent";
import { ImageCardContent } from "./variants/ImageCardContent";
import "./GameCard.scss";
import { Heading } from "../../../../../../shared/infrastructure/ui/components/Heading";
import { computedClassNames } from "../../../../../../shared/infrastructure/utils/computedClassNames";
import { Image } from "../../../../../../shared/infrastructure/ui/components/Image";

const CARD_RENDERERS: Record<CardContentType, (card: MemoryCard) => React.ReactNode> = {
  [CardContentType.Text]: (card) => <TextCardContent text={card.content} />,
  [CardContentType.Color]: (card) => <ColorCardContent color={card.content} />,
  [CardContentType.Image]: (card) => <ImageCardContent src={card.content} alt={card.title} />,
};

interface GameCardProps {
  card: MemoryCard;
  backFaceLogo?: string;
  onClick?(card: MemoryCard): void;
}

export function GameCard(props: GameCardProps) {
  const { title, subtitle, type, state } = props.card;

  const gameCardClassNames = computedClassNames({
    "game-card": true,
    [`game-card--${state}`]: state,
  });

  return (
    <button className={gameCardClassNames} onClick={() => props.onClick?.(props.card)}>
      <div className="game-card__front">
        <div className="game-card__content">{CARD_RENDERERS[type](props.card)}</div>

        <div className="game-card__footer">
          <Heading type="h3" title={title} className="game-card__title">
            {title}
          </Heading>

          {subtitle ? (
            <Heading type="h4" title={subtitle} className="game-card__subtitle" size="xs" color="black">
              {subtitle}
            </Heading>
          ) : null}
        </div>
      </div>

      <div className="game-card__back">
        {props.backFaceLogo ? (
          <Image src={props.backFaceLogo} width="180px" height="180px" alt="Memory card back face logo" draggable={false} />
        ) : (
          <span className="game-card__back-logo">❓</span>
        )}
      </div>
    </button>
  );
}
