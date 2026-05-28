import { AppError } from "../../../../shared/domain/errors/AppErrors";

export const GameSessionErrors = {
  EMPTY_PLAYER_LIST: "SESSION_EMPTY_PLAYER_LIST",
  INVALID_MAX_MATCHES: "SESSION_INVALID_MAX_MATCHES",
  ALREADY_FINISHED: "SESSION_ALREADY_FINISHED",
  NOT_INITIALIZED: "SESSION_NOT_INITIALIZED",
  NOT_STARTED: "SESSION_NOT_STARTED",
  INVALID_PLAYER_PROGRESS: "SESSION_INVALID_PLAYER_PROGRESS",
} as const;

export class EmptyPlayerListError extends AppError {
  constructor() {
    super({
      message: "The game session cannot be started without players. Please add at least one player to begin the game.",
      code: GameSessionErrors.EMPTY_PLAYER_LIST,
    });
  }
}

export class InvalidMaxMatchesError extends AppError {
  constructor(providedValue: number) {
    super({
      message: `The maximum number of matches must be greater than zero. Received: ${providedValue}`,
      code: GameSessionErrors.INVALID_MAX_MATCHES,
    });
  }
}

export class GameSessionAlreadyFinishedError extends AppError {
  constructor(actionName: string) {
    super({
      message: `You cannot perform the action "${actionName}" because the game session has already finished.`,
      code: GameSessionErrors.ALREADY_FINISHED,
    });
  }
}

export class GameSessionNotInitializedError extends AppError {
  constructor(actionName: string) {
    super({
      message: `You cannot perform the action "${actionName}" because the game session is not initialized.`,
      code: GameSessionErrors.NOT_INITIALIZED,
    });
  }
}

export class GameSessionNotStartedError extends AppError {
  constructor(actionName: string) {
    super({
      message: `You cannot perform the action "${actionName}" because the game session is not started.`,
      code: GameSessionErrors.NOT_STARTED,
    });
  }
}

export class InvalidPlayerProgressError extends AppError {
  constructor(reason: string) {
    super({
      message: `Invalid player progress state: ${reason}`,
      code: GameSessionErrors.INVALID_PLAYER_PROGRESS,
    });
  }
}
