import { DBMapSetting, MapSettingModel } from "@/models";
import MapSettingMapper from "@/mappers/mapSettingMapper";

import { Repository } from "@/repositories/Repository";
import { MapSettingDto } from "@/shared/interfaces/dtos";
import { IMapper } from "@/interfaces";

class MapSettingService {
  private repository: Repository<DBMapSetting>;
  private _mapper: IMapper<DBMapSetting, MapSettingDto>;

  constructor() {
    this.repository = new Repository<DBMapSetting>(MapSettingModel);
    this._mapper = new MapSettingMapper();
  }
  async find(id: string): Promise<MapSettingDto> {
    var response = await this.repository.find(id);
    return this._mapper.toDto(response);
  }
  async findAll(): Promise<MapSettingDto[]> {
    var response = await this.repository.findAll();
    return response.map((item) => this._mapper.toDto(item));
  }
  async create(mapsettings: MapSettingDto): Promise<MapSettingDto> {
    var response = await this.repository.create(this._mapper.toDBModel(mapsettings));
    return this._mapper.toDto(response);
  }

  async update(id: string, mapsettings: MapSettingDto): Promise<MapSettingDto> {
    if (id !== mapsettings.id) throw new Error("Id in body does not match id in url");
    var response = await this.repository.update(id, this._mapper.toDBModel(mapsettings));
    return this._mapper.toDto(response);
  }
  async delete(id: string): Promise<MapSettingDto> {
    var response = await this.repository.delete(id);
    return this._mapper.toDto(response);
  }
}

export { MapSettingService };
