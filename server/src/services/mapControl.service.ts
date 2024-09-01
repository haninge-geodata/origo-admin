import { DBMapControl, MapControlModel } from "@/models";
import MapControlMapper from "@/mappers/mapControlMapper";
import { Repository } from "@/repositories/Repository";
import { MapControlDto } from "@/shared/interfaces/dtos";
import { IMapper } from "@/interfaces";
class MapControlService {
  private repository: Repository<DBMapControl>;
  private _mapper: IMapper<DBMapControl, MapControlDto>;

  constructor() {
    this.repository = new Repository<DBMapControl>(MapControlModel);
    this._mapper = new MapControlMapper();
  }
  async find(id: string): Promise<MapControlDto> {
    var response = await this.repository.find(id);
    return this._mapper.toDto(response);
  }
  async findAll(): Promise<MapControlDto[]> {
    var response = await this.repository.findAll();
    return response.map((item) => this._mapper.toDto(item));
  }
  async create(mapControl: MapControlDto): Promise<MapControlDto> {
    var response = await this.repository.create(this._mapper.toDBModel(mapControl));
    return this._mapper.toDto(response);
  }

  async update(id: string, mapControl: MapControlDto): Promise<MapControlDto> {
    if (id !== mapControl.id) throw new Error("Id in body does not match id in url");
    var response = await this.repository.update(id, this._mapper.toDBModel(mapControl));
    return this._mapper.toDto(response);
  }
  async delete(id: string): Promise<MapControlDto> {
    var response = await this.repository.delete(id);
    return this._mapper.toDto(response);
  }
}

export { MapControlService };
