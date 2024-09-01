import { DBStyleSchema, StyleSchemaModel } from "@/models";
import StyleSchemaMapper from "@/mappers/styleSchemaMapper";
import { IMapper } from "@/interfaces";
import { Repository } from "@/repositories/Repository";
import { StyleSchemaDto } from "@/shared/interfaces/dtos";

class StyleSchemaService {
  private repository: Repository<DBStyleSchema>;
  private _mapper: IMapper<DBStyleSchema, StyleSchemaDto>;
  constructor() {
    this.repository = new Repository<DBStyleSchema>(StyleSchemaModel);
    this._mapper = new StyleSchemaMapper();
  }
  async find(id: string): Promise<StyleSchemaDto> {
    var response = await this.repository.find(id);
    return this._mapper.toDto(response);
  }
  async findAll(): Promise<StyleSchemaDto[]> {
    var response = await this.repository.findAll();
    return response.map((item) => this._mapper.toDto(item));
  }
  async create(styleSchema: StyleSchemaDto): Promise<StyleSchemaDto> {
    var response = await this.repository.create(this._mapper.toDBModel(styleSchema, true));
    return this._mapper.toDto(response);
  }

  async update(id: string, styleSchema: StyleSchemaDto): Promise<StyleSchemaDto> {
    if (id !== styleSchema.id) throw new Error("Id in body does not match id in url");
    var response = await this.repository.update(id, this._mapper.toDBModel(styleSchema));
    return this._mapper.toDto(response);
  }
  async delete(id: string): Promise<StyleSchemaDto> {
    var response = await this.repository.delete(id);
    return this._mapper.toDto(response);
  }
}

export { StyleSchemaService };
