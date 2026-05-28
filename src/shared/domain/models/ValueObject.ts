export abstract class ValueObject<T> {
  constructor(protected readonly props: T) {
    Object.freeze(this);
  }

  public equals(obj?: ValueObject<T>): boolean {
    if (obj === null || obj === undefined) return false;
    if (obj.props === undefined) return false;
    return JSON.stringify(this.props) === JSON.stringify(obj.props);
  }
}
