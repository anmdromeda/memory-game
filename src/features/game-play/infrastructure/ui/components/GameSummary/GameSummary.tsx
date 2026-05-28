import "./GameSummary.scss";
import { Heading } from "../../../../../../shared/infrastructure/ui/components/Heading";
import { Paragraph } from "../../../../../../shared/infrastructure/ui/components/Paragraph";
import { GameButton } from "../GameButton";

interface GameSummaryProps {
  turns: number;
  onRepeat?(): void;
  onGoHome?(): void;
}

export function GameSummary({ turns, onRepeat, onGoHome }: GameSummaryProps) {
  return (
    <div className="game-summary">
      <Heading type="h1" size="3xl" color="heading" className="game-summary__heading">
        ¡Felicitaciones!
      </Heading>

      <Paragraph size="xl" color="black" weight="medium" className="game-summary__score">
        Terminaste el juego con {turns} turnos
      </Paragraph>

      <div className="game-summary__actions">
        <GameButton variant="primary" onClick={onRepeat} action="repeat">
          Repetir
        </GameButton>

        <GameButton variant="secondary" onClick={onGoHome} action="go-home">
          Inicio
        </GameButton>
      </div>
    </div>
  );
}
