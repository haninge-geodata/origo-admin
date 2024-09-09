import { Repository } from "@/repositories/Repository";
import { DBFavoriteseMap, FavoritesModel } from "@/models/favorites.model";
import { FavoritesDto } from "@/shared/interfaces/dtos";
import FavoritesMapper from "@/mappers/favoritesMapMapper";
import { IMapper } from "@/interfaces";

class FavoritesService {
  private repository: Repository<DBFavoriteseMap>;
  private _mapper: IMapper<DBFavoriteseMap, FavoritesDto>;

  constructor() {
    this.repository = new Repository<DBFavoriteseMap>(FavoritesModel);
    this._mapper = new FavoritesMapper();
  }

  async find(id: string): Promise<FavoritesDto> {
    var response = await this.repository.find(id);
    return this._mapper.toDto(response);
  }

  //TODO: Change this when auth is implemented
  async getByUser(user: string): Promise<FavoritesDto[]> {
    var response = await this.repository.findByCriteria({ user: user });
    return response.map((item) => this._mapper.toDto(item));
  }

  async create(favorites: FavoritesDto): Promise<FavoritesDto> {
    var response = await this.repository.create(
      this._mapper.toDBModel(favorites)
    );
    return this._mapper.toDto(response);
  }

  async update(id: string, favorites: FavoritesDto): Promise<FavoritesDto> {
    if (id !== favorites.id)
      throw new Error("Id in body does not match id in url");
    var response = await this.repository.update(
      id,
      this._mapper.toDBModel(favorites)
    );
    return this._mapper.toDto(response);
  }

  async delete(id: string): Promise<FavoritesDto> {
    var response = await this.repository.delete(id);
    return this._mapper.toDto(response);
  }
}

export { FavoritesService };
