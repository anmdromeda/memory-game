export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  create(item: Partial<T> | T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
