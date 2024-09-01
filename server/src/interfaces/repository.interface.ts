interface IRepository<T> {
  find(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(model: T): Promise<T>;
  update(id: string, model: T): Promise<T>;
  delete(id: string): Promise<T | null>;
}

export { IRepository };
