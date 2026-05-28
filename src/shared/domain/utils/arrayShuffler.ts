export class ArrayShuffler {
  static shuffle<T>(items: T[]): T[] {
    const shuffledDeck = [...items];

    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [shuffledDeck[i], shuffledDeck[randomIndex]] = [shuffledDeck[randomIndex], shuffledDeck[i]];
    }

    return shuffledDeck;
  }
}
