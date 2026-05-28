import { Heading } from "../../../../../../shared/infrastructure/ui/components/Heading";
import type { PlayerProgress } from "../../../../domain/models/Player";
import "./GameStats.scss";

interface GameStatsProps {
  readonly playerProgress: PlayerProgress;
}

export function GameStats({ playerProgress: { score, moves } }: GameStatsProps) {
  return (
    <ul className="game-stats">
      <li className="game-stats__item">
        <Heading type="h3" size="xl" color="black">
          <span>Aciertos: {score}</span>
        </Heading>
      </li>

      <li className="game-stats__item">
        <Heading type="h2" size="xl" color="black">
          <span>Turnos: {moves}</span>
        </Heading>
      </li>
    </ul>
  );
}
