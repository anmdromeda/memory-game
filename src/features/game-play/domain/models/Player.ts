import { ValueObject } from "../../../../shared/domain/models/ValueObject";
import { InvalidPlayerProgressError } from "../errors/GameSessionErrors";

export interface Player {
  readonly id: string;
  readonly name: string;
}

export interface PlayerProgressProps {
  readonly score: number;
  readonly moves: number;
  readonly misses: number;
}

export class PlayerProgress extends ValueObject<PlayerProgressProps> {
  private constructor(props: PlayerProgressProps) {
    super(props);
    this.validate(props);
  }

  public static create(): PlayerProgress {
    return new PlayerProgress({
      score: 0,
      moves: 0,
      misses: 0,
    });
  }

  public static fromRaw(props: PlayerProgressProps): PlayerProgress {
    return new PlayerProgress(props);
  }

  public get score(): number {
    return this.props.score;
  }

  public get moves(): number {
    return this.props.moves;
  }

  public get misses(): number {
    return this.props.misses;
  }

  public incrementMatch(): PlayerProgress {
    return new PlayerProgress({
      score: this.props.score + 1,
      moves: this.props.moves + 1,
      misses: this.props.misses,
    });
  }

  public incrementMiss(): PlayerProgress {
    return new PlayerProgress({
      score: this.props.score,
      moves: this.props.moves + 1,
      misses: this.props.misses + 1,
    });
  }

  public toRaw(): PlayerProgressProps {
    return { ...this.props };
  }

  private validate(props: PlayerProgressProps): void {
    if (props.score < 0 || props.moves < 0 || props.misses < 0) {
      throw new InvalidPlayerProgressError("Metrics cannot be negative numbers.");
    }

    if (props.score + props.misses > props.moves) {
      throw new InvalidPlayerProgressError("The sum of scores and misses cannot exceed total moves.");
    }
  }
}
