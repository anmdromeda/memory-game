import { InvalidArgumentError } from "../../../../shared/domain/errors/AppErrors";
import { ValueObject } from "../../../../shared/domain/models/ValueObject";

export enum Difficulty {
  Easy = "EASY",
  Medium = "MEDIUM",
  Hard = "HARD",
}

const GROUP_LENGTH_BY_DIFFICULTY: Record<Difficulty, number> = Object.freeze({
  [Difficulty.Easy]: 2,
  [Difficulty.Medium]: 3,
  [Difficulty.Hard]: 4,
});

const DECK_SIZE_BY_DIFFICULTY: Record<Difficulty, number> = Object.freeze({
  [Difficulty.Easy]: 6,
  [Difficulty.Medium]: 12,
  [Difficulty.Hard]: 18,
});

export type GameDifficultyProps = {
  groupDifficulty: Difficulty;
  deckSizeDifficulty: Difficulty;
};

export class GameDifficulty extends ValueObject<GameDifficultyProps> {
  private constructor(props: GameDifficultyProps) {
    super(props);
  }

  public static create(props: GameDifficultyProps): GameDifficulty {
    const { groupDifficulty, deckSizeDifficulty } = props;

    const allowedDifficulty = Object.values(Difficulty);

    if (!allowedDifficulty.includes(groupDifficulty as Difficulty)) {
      throw new InvalidArgumentError("groupDifficulty", groupDifficulty);
    }

    if (!allowedDifficulty.includes(deckSizeDifficulty as Difficulty)) {
      throw new InvalidArgumentError("deckSizeDifficulty", deckSizeDifficulty);
    }

    return new this({ groupDifficulty, deckSizeDifficulty });
  }

  public getDeckSize(): number {
    return DECK_SIZE_BY_DIFFICULTY[this.props.deckSizeDifficulty];
  }

  public getMatchGroupSize(): number {
    return GROUP_LENGTH_BY_DIFFICULTY[this.props.groupDifficulty];
  }

  public getTotalMatches(): number {
    return this.getDeckSize();
  }
}
