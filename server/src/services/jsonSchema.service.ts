import { DBJsonSchema, JsonSchemaModel } from "@/models/jsonSchema.model";
import { jsonSchemaMapper } from "@/mappers/jsonSchemaMapper";
import { IMapper } from "@/interfaces";
import { Repository } from "@/repositories/Repository";
import { JsonSchemaDto } from "@/shared/interfaces/dtos";

class JsonSchemaService {
  private repository: Repository<DBJsonSchema>;
  private _mapper: IMapper<DBJsonSchema, JsonSchemaDto>;

  constructor() {
    this.repository = new Repository<DBJsonSchema>(JsonSchemaModel);
    this._mapper = jsonSchemaMapper;
  }

  async find(id: string): Promise<JsonSchemaDto> {
    const response = await this.repository.find(id);
    return this._mapper.toDto(response);
  }

  async findByName(name: string): Promise<JsonSchemaDto | null> {
    const response = await this.repository.findByCriteria({ name: name });
    if (response.length === 0) return null;
    return this._mapper.toDto(response[0]);
  }

  async findAll(): Promise<JsonSchemaDto[]> {
    const response = await this.repository.findAll();
    return response.map((item) => this._mapper.toDto(item));
  }

  async findVisible(): Promise<JsonSchemaDto[]> {
    const response = await this.repository.findByCriteria({ visible: true });
    return response.map((item) => this._mapper.toDto(item));
  }

  async create(jsonSchema: JsonSchemaDto): Promise<JsonSchemaDto> {
    const existing = await this.findByName(jsonSchema.name);
    if (existing) {
      throw new Error(`Schema with name "${jsonSchema.name}" already exists`);
    }

    const response = await this.repository.create(
      this._mapper.toDBModel(jsonSchema, true)
    );
    return this._mapper.toDto(response);
  }

  async update(id: string, jsonSchema: JsonSchemaDto): Promise<JsonSchemaDto> {
    if (id !== jsonSchema.id) {
      throw new Error("Id in body does not match id in url");
    }

    const existing = await this.find(id);
    if (existing.name !== jsonSchema.name) {
      const nameExists = await this.findByName(jsonSchema.name);
      if (nameExists && nameExists.id !== id) {
        throw new Error(`Schema with name "${jsonSchema.name}" already exists`);
      }
    }

    const response = await this.repository.update(
      id,
      this._mapper.toDBModel(jsonSchema)
    );
    return this._mapper.toDto(response);
  }

  async delete(id: string): Promise<JsonSchemaDto> {
    const response = await this.repository.delete(id);
    return this._mapper.toDto(response);
  }
}

export { JsonSchemaService };
