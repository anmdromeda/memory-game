import type { EventBus, Events, Subscriber } from "../../application/EventBus";

export class InMemoryEventBus implements EventBus {
  private subscribers: Map<keyof Events, Set<Subscriber<unknown>>> = new Map();

  public on<K extends keyof Events>(event: K, callback: Subscriber<Events[K]>): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }

    this.subscribers.get(event)!.add(callback as never);

    return () => this.off(event, callback);
  }

  public emit<K extends keyof Events>(event: K, data?: Events[K]): void {
    const eventSubscribers = this.subscribers.get(event);

    if (eventSubscribers && eventSubscribers.size > 0) {
      [...eventSubscribers].forEach((callback) => {
        try {
          callback(data);
        } catch {
          //
        }
      });
    }
  }

  public off<K extends keyof Events>(event: K, callback: Subscriber<Events[K]>): void {
    const eventSubscribers = this.subscribers.get(event);
    if (eventSubscribers) {
      eventSubscribers.delete(callback as never);

      if (eventSubscribers.size === 0) {
        this.subscribers.delete(event);
      }
    }
  }

  public clear(event?: keyof Events): void {
    if (event) {
      this.subscribers.delete(event);
    } else {
      this.subscribers.clear();
    }
  }
}

export const inMemoryEventBus = new InMemoryEventBus();
