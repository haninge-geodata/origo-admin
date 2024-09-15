import { Repository } from "@/repositories/Repository";
import { Model } from "mongoose";
import { DBLayerBase } from "@/models/layer.model";

class LayerService<T extends DBLayerBase, TDto> {
  private repository: Repository<T>;
  private toDtoMapper: (doc: T) => TDto;
  private toDbMapper: (doc: TDto, create: boolean) => T;

  constructor(
    model: Model<T>,
    mapper: (doc: T) => TDto,
    dbMapper: (doc: TDto, create: boolean) => T
  ) {
    this.repository = new Repository<T>(model);
    this.toDbMapper = dbMapper;
    this.toDtoMapper = mapper;
  }

  async find(id: string): Promise<TDto> {
    let response = await this.repository.find(id);
    return this.toDtoMapper(response);
  }

  async getByName(name: string): Promise<TDto[]> {
    var response = await this.repository.query({ name: name });
    return response.map((item) => this.toDtoMapper(item));
  }

  async findAll(): Promise<TDto[]> {
    let response = await this.repository.findAll();
    return response.map((item) => this.toDtoMapper(item));
  }
  async create(layers: TDto[]): Promise<TDto[]> {
    let dbObjects = layers.map((item) => this.toDbMapper(item, true));
    let created = [];
    for (const dbObject of dbObjects) {
      try {
        const createdObject = await this.repository.create(dbObject);
        const fetchedObject = await this.repository.find(
          createdObject._id.toString()
        );
        created.push(fetchedObject);
      } catch (error) {
        console.error(error);
      }
    }
    return created.map((item) => this.toDtoMapper(item));
  }

  async update(id: string, layer: TDto): Promise<TDto> {
    let dbObject = this.toDbMapper(layer, false);
    await this.repository.update(id, dbObject);
    let updated = await this.repository.find(id);
    return this.toDtoMapper(updated);
  }
  async duplicate(id: string): Promise<TDto> {
    let objectToDuplicate = await this.repository.find(id);
    let newObject = objectToDuplicate.toObject();
    delete newObject._id;

    newObject.title = newObject.title + " (copy)";
    await this.repository.create(newObject);
    let duplicated = await this.repository.find(id);
    return this.toDtoMapper(duplicated);
  }

  async delete(id: string): Promise<TDto> {
    const objectedToDelete = await this.repository.find(id);
    await this.repository.delete(objectedToDelete._id.toString());
    return this.toDtoMapper(objectedToDelete);
  }
}

export { LayerService };
