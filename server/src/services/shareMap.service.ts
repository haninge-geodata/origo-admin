import { Repository } from "@/repositories/Repository";
import { DBShareMap, ShareMapModel } from "@/models/shareMap.model";
import { ShareMapDto } from "@/shared/interfaces/dtos";
import ShareMapMapper from "@/mappers/shareMapMapper";
import { IMapper } from "@/interfaces";

class ShareMapService {
  private repository: Repository<DBShareMap>;
  private _mapper: IMapper<DBShareMap, ShareMapDto>;

  constructor() {
    this.repository = new Repository<DBShareMap>(ShareMapModel);
    this._mapper = new ShareMapMapper();
  }
  async find(id: string): Promise<ShareMapDto> {
    var response = await this.repository.find(id);
    return this._mapper.toDto(response);
  }
  //TODO: Change this when auth is implemented
  async getByUser(user: string): Promise<ShareMapDto[]> {
    var response = await this.repository.findByCriteria({ user: user });
    return response.map((item) => this._mapper.toDto(item));
  }
  async create(shareMap: ShareMapDto): Promise<ShareMapDto> {
    var response = await this.repository.create(this._mapper.toDBModel(shareMap));
    return this._mapper.toDto(response);
  }

  async update(id: string, shareMap: ShareMapDto): Promise<ShareMapDto> {
    if (id !== shareMap.id) throw new Error("Id in body does not match id in url");
    var response = await this.repository.update(id, this._mapper.toDBModel(shareMap));
    return this._mapper.toDto(response);
  }
  async delete(id: string): Promise<ShareMapDto> {
    var response = await this.repository.delete(id);
    return this._mapper.toDto(response);
  }
}

export { ShareMapService };
