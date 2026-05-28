export type Events = {
  "game-play:cards-group-flipped": { isMatch: boolean };
  "game-play:card-flipped": { cardId: string };
  "game-play:match-ended": { scores: Record<string, { moves: number; misses: number }> };
  "auth:logout-requested": void;
  "game-play:button-pressed": { action: string };
};

export type Subscriber<T> = (data: T) => void | Promise<void>;

export interface EventBus {
  on<K extends keyof Events>(event: K, callback: Subscriber<Events[K]>): () => void;
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
  off<K extends keyof Events>(event: K, callback: Subscriber<Events[K]>): void;
  clear(event?: keyof Events): void;
}
